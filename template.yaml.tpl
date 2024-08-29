AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31
Description: >
  NR APM (Application Performance and Monitoring) Stack

# More info about Globals: https://github.com/awslabs/serverless-application-model/blob/master/docs/globals.rst
Globals:
  Function:
    Timeout: 60
    MemorySize: 1024
    Environment:
      Variables:
        LOG_LEVEL: !Ref LogLevel

Parameters:
  # Environment:
  #   Type: String
  #   AllowedValues:
  #     - dev
  #     - test
  #     - prod
  #   Default: "dev"
  LambdaHandler:
    Type: String
    Default: "index.kinesisStreamHandler"
  LogLevel:
    Type: String
    Default: "info"
  KinesisStreamShardCount:
    Type: Number
    MinValue: 1
    MaxValue: 10
    Default: 1
  OpensearchUrl:
    Type: String
    Default: ""

Resources:

  ## Roles

  LambdaStreamRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: !Join
        - ''
        - - !Ref AWS::Region
          - -nr-apm-stack-lambda-stream
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service:
                - lambda.amazonaws.com
            Action:
              - 'sts:AssumeRole'
      ManagedPolicyArns:
        - 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
      Policies:
        - PolicyName: 'kinesis-consumer'
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Action:
                  - kinesis:SubscribeToShard
                  - kinesis:GetShardIterator
                  - kinesis:GetRecords
                  - kinesis:DescribeStream
                Resource:
                  - !GetAtt Stream.Arn
                Effect: Allow
              - Action:
                  - kinesis:ListStreams
                  - kinesis:ListShards
                Resource:
                  - "*"
                Effect: Allow
        - PolicyName: 'dlq-producer'
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Action:
                  - firehose:PutRecord
                  - firehose:PutRecordBatch
                Resource:
                  - !GetAtt DlqStream.Arn
                Effect: Allow

  FirehoseRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service:
                - firehose.amazonaws.com
            Action:
              - 'sts:AssumeRole'
      Policies:
        - PolicyName: 'firehose-dlq'
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Action:
                - glue:GetTable
                - glue:GetTableVersion
                - glue:GetTableVersions
                Resource:
                  - !Join
                    - ''
                    - - "arn:aws:glue:"
                      - !Ref AWS::Region
                      - ':'
                      - !Ref AWS::AccountId
                      - ':catalog'
                Effect: Allow
              - Action:
                - s3:AbortMultipartUpload
                - s3:GetBucketLocation
                - s3:GetObject
                - s3:ListBucket
                - s3:ListBucketMultipartUploads
                - s3:PutObject
                Resource:
                  - !GetAtt DlqBucket.Arn
                  - !Join
                    - ''
                    - - !GetAtt DlqBucket.Arn
                      - "/*"
                Effect: Allow
              - Action:
                - logs:PutLogEvents
                Resource:
                  - !Join
                    - ''
                    - - "arn:aws:logs:"
                      - !Ref AWS::Region
                      - ':'
                      - !Ref AWS::AccountId
                      - ':log-group:/aws/kinesisfirehose/'
                      - 'apm-dlq-stream'
                      - ':log-stream:DestinationDelivery'
                Effect: Allow

  ## Policies

  # Access to push documents to kinesis stream consumed by lambda
  # Roles created for team access to add documents to Opensearch should attach this policy.
  # (Would) replace nress-prod-nrm-agents policy
  # Disabled because we can't manage PBMMOps-BCGOV_ roles
  # AgentPolicy:
  #   Type: AWS::IAM::Policy
  #   Properties:
  #     PolicyName: nr-apm-stack-stream-put-document
  #     PolicyDocument:
  #       Version: '2012-10-17'
  #       Statement:
  #         - Action:
  #           - kinesis:PutRecord
  #           - kinesis:PutRecords
  #           Resource:
  #           - !GetAtt Stream.Arn
  #           Effect: Allow
  #     Roles:
  #       - !Join
  #         - ''
  #         - - PBMMOps-BCGOV_
  #           - !Ref Environment
  #           - _Project_Role_ES_Role

  ## Opensearch

  ## Lambda layers

  MaxmindGeoIpLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      CompatibleRuntimes:
        - nodejs20.x
      ContentUri: ./layer/maxmind-geoip-db
      LayerName: maxmind-geoip-db
      RetentionPolicy: Delete

  ## Lambda functions

  EventStreamProcessing:
    Type: AWS::Serverless::Function # More info about Function Resource: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
    Properties:
      CodeUri: event-stream-processing/
      Handler: !Ref LambdaHandler
      Role: !GetAtt LambdaStreamRole.Arn
      Runtime: nodejs20.x
      Architectures:
      - x86_64
      Environment:
        Variables:
          DLQ_STREAM_NAME: !Ref DlqStream
          ES_URL: !Ref OpensearchUrl
          MAXMIND_DB_DIR: /opt/nodejs/asset
      Layers:
        - !Ref MaxmindGeoIpLayer
      Events:
        Stream:
          Type: Kinesis
          Properties:
            Stream: !GetAtt Stream.Arn
            BatchSize: 10000
            ParallelizationFactor: 2
            MaximumBatchingWindowInSeconds: 10
            MaximumRecordAgeInSeconds: -1
            MaximumRetryAttempts: -1
            StartingPosition: LATEST

    Metadata: # Manage esbuild properties
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: es2020
        Sourcemap: true
        EntryPoints:
        - src/index.ts

  ## S3 Buckets
  DlqBucket:
    Type: AWS::S3::Bucket
    Properties:
      LifecycleConfiguration:
        Rules:
          - ExpirationInDays: 7
            Status: Enabled

  ## Stream

  Stream:
    Type: AWS::Kinesis::Stream
    Properties:
      Name: nr-apm-stack-documents
      ShardCount: !Ref KinesisStreamShardCount
      # Enhanced can't be enabled...
      # https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/768
      # shard_level_metrics = [
      #   "IncomingRecords",
      #   "IncomingBytes",
      #   "OutgoingBytes",
      #   "IteratorAgeMilliseconds",
      #   "OutgoingRecords",
      #   "ReadProvisionedThroughputExceeded",
      #   "WriteProvisionedThroughputExceeded"
      # ]

  DlqStream:
    Type: AWS::KinesisFirehose::DeliveryStream
    Properties:
      DeliveryStreamName: apm-dlq-stream
      ExtendedS3DestinationConfiguration:
        RoleARN: !GetAtt FirehoseRole.Arn
        BucketARN: !GetAtt DlqBucket.Arn
        CloudWatchLoggingOptions:
          Enabled: true
          LogGroupName: /aws/kinesisfirehose/apm-dlq-stream
          LogStreamName: DestinationDelivery
  # SNS role so that opensearch can publish to topics
  SnsRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: "opensearch_sns_nress-prod"
      Policies:
        - PolicyName: "opensearch_sns_role_policy"
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: "Allow"
                Action:
                  - "sns:Publish"
                Resource:<% notifications.filter((n) => n.configType == 'sns').forEach((notification) => { %>
                - !GetAtt <%= notification.entity %>.TopicArn<% }); %>
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
        - Action: "sts:AssumeRole"
          Effect: "Allow"
          Principal:
            Service: "es.amazonaws.com"
          Sid: ""
<% notifications.filter((n) => n.configType == 'sns').forEach((notification) => { %>
  <%= notification.entity %>:
    Type: AWS::SNS::Topic
    Properties:
      TopicName: "<%= notification.sns.topicArn %>"
      DisplayName: "<%= notification.name %>"<% if (notification.sns.subscriptions) { %><% notification.sns.subscriptions.forEach((sub) => { %>
  <%= sub.entity %>Sub:
    Type: AWS::SNS::Subscription
    Properties:
      Endpoint: <% if (sub.protocol == 'sqs') { %>!GetAtt <%= sub.entity %>.Arn<% } else if (sub.protocol == 'email' || sub.protocol == 'sns') { %>"<%= sub.endpoint %>"<% } %>
      Protocol: "<%= sub.protocol %>"
      TopicArn: !GetAtt <%= notification.entity %>.TopicArn <% if (sub.protocol == 'sqs') { %>
  <%= sub.entity %>:
    Type: AWS::SQS::Queue
    Properties:
      QueueName: "<%= sub.endpoint %>"
  <%= sub.entity %>InlinePolicy:
    Type: AWS::SQS::QueueInlinePolicy
    Properties:
      PolicyDocument:
        Version: '2012-10-17'
        Statement:
        - Sid: "Stmt1/<%= sub.entity %>/SQSDefaultPolicy"
          Effect: Allow
          Principal: "*"
          Action: sqs:SendMessage
          Resource: !GetAtt <%= sub.entity %>.Arn
      Queue: !Ref <%= sub.entity %><% }}) } -%>
<% }); -%>

Outputs:
  FunctionName:
    Description: "Function name"
    Value: !Ref EventStreamProcessing
  FunctionRole:
    Description: "Function Role"
    Value: !GetAtt LambdaStreamRole.Arn
  StreamARN:
    Description: "Stream ARN"
    Value: !GetAtt Stream.Arn