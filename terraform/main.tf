# Reference & Examples:
# * https://hands-on.cloud/terraform-recipe-how-to-create-aws-elasticsearch-cluster/
# * https://medium.com/neiman-marcus-tech/building-a-secure-aws-managed-elasticsearch-cluster-using-terraform-ea876f79d297
# * https://github.com/BCDevOps/terraform-octk-aws-sea-network-info/blob/master/main.tf

# Space tygsv5-dev

terraform {
  required_providers {
    aws = {
      source = "hashicorp/aws"
      version = "4.16.0"
    }
    elasticsearch = {
      source = "phillbaker/elasticsearch"
      version = "2.0.2"
    }
  }
}

provider "aws" {
  region = var.region
  assume_role {
    role_arn = "arn:aws:iam::${var.target_aws_account_id}:role/BCGOV_${var.target_env}_Automation_Admin_Role"
  }
}

locals {
  es_domain_name =  "nress${var.suffix}"
  iam_service_accounts = ["arn:aws:iam::774621113276:user/project-service-accounts/BCGOV_Project_User_elasticsearch_agent_tygsv5"]
}

# Retrieve the security groups
/*
data "aws_security_groups" "web" {
  filter {
    name   = "tag:Name"
    values = ["Web_sg"]
  }
}
*/
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

locals {
  caller_assumed_role = split("/", data.aws_caller_identity.current.arn)[1]
}

locals {
  iam_role_arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${local.caller_assumed_role}"
}

resource "time_static" "log_group_suffix" {}

data "aws_iam_policy_document" "access_policies" {
  # Anonymous access is allowed to support SAML/Keycloak integration
  statement {
    effect = "Allow"
    actions = [
      "es:*",
    ]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    resources = [
      "arn:aws:es:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:domain/${local.es_domain_name}/*",
    ]
  }

  # Allows the current account (admin) assumed role to interact with Opensearch
  statement {
    effect = "Allow"
    actions = [
      "es:*",
    ]
    principals {
      type        = "AWS"
      identifiers = [local.iam_role_arn]
    }
    resources = [
      "arn:aws:es:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:domain/${local.es_domain_name}/*",
    ]
  }
}
resource "aws_cloudwatch_log_group" "es_application_logs" {
  name = "/aws/aes/domains/${ local.es_domain_name }-${ time_static.log_group_suffix.unix }/application-logs"
  retention_in_days = 90
}

resource "aws_cloudwatch_log_group" "es_audit_logs" {
  name = "/aws/aes/domains/${ local.es_domain_name }-${ time_static.log_group_suffix.unix }/audit-logs"
  retention_in_days = 90
}

resource "aws_cloudwatch_log_resource_policy" "es_logs" {
  policy_name = "${local.es_domain_name}-${ time_static.log_group_suffix.unix }"
  policy_document = <<CONFIG
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "es.amazonaws.com"
      },
      "Action": [
        "logs:PutLogEvents",
        "logs:PutLogEventsBatch",
        "logs:CreateLogStream"
      ],
      "Resource": [
        "arn:aws:logs:*",
        "${aws_cloudwatch_log_group.es_application_logs.arn}/*",
        "${aws_cloudwatch_log_group.es_audit_logs.arn}/*"
      ]
    }
  ]
}
CONFIG
}

resource "aws_opensearch_domain" "es" {
  domain_name           = local.es_domain_name
  # Not provided as we manage manually
  # engine_version = "7.10"
  # VPC deployment is not supported atm. We can used public endpoint while we experiment
  #vpc_options {
  #  subnet_ids         = data.aws_subnet_ids.web.ids
  #  security_group_ids = data.aws_security_groups.web.ids
  #}
  lifecycle {
    ignore_changes = [ engine_version, advanced_options ]
    prevent_destroy = true
  }
  domain_endpoint_options {
    enforce_https       = true
    tls_security_policy = "Policy-Min-TLS-1-2-2019-07"
    custom_endpoint_enabled = var.custom_endpoint == null ? false : true
    custom_endpoint = var.custom_endpoint
    custom_endpoint_certificate_arn  = var.custom_endpoint_certificate_arn
  }
  encrypt_at_rest {
    enabled = true
  }
  advanced_security_options {
    enabled = true
    internal_user_database_enabled = false
    master_user_options {
      master_user_arn = local.iam_role_arn
    }
  }
  cluster_config {
    dedicated_master_enabled = var.master_node_instance_count > 0 ? true : false
    dedicated_master_count = var.master_node_instance_count
    dedicated_master_type = var.master_node_instance_type
    instance_count = var.data_node_instance_count
    instance_type = var.data_node_instance_type
    zone_awareness_enabled = true
    zone_awareness_config {
      availability_zone_count = var.master_node_instance_count > 0 ? 2 : 2
    }
    warm_enabled = var.ultrawarm_node_instance_count == null ? false : true
    warm_count = var.ultrawarm_node_instance_count
    warm_type = var.ultrawarm_node_instance_count == null ? null : var.ultrawarm_node_instance_type
  }
  ebs_options {
    ebs_enabled = true
    volume_size = var.data_node_volume_size
  }
  node_to_node_encryption {
    enabled = true
  }
  access_policies = data.aws_iam_policy_document.access_policies.json
  log_publishing_options {
    cloudwatch_log_group_arn = aws_cloudwatch_log_group.es_application_logs.arn # "arn:aws:logs:${data.aws_region.current.name}:${ data.aws_caller_identity.current.account_id }:log-group:/aws/aes/domains/${ local.es_domain_name }/application-logs"
    enabled                  = true
    log_type                 = "ES_APPLICATION_LOGS"
  }
  log_publishing_options {
    cloudwatch_log_group_arn = aws_cloudwatch_log_group.es_audit_logs.arn # "arn:aws:logs:${data.aws_region.current.name}:${ data.aws_caller_identity.current.account_id }:log-group:/aws/aes/domains/${ local.es_domain_name }/audit-logs"
    enabled                  = true
    log_type                 = "AUDIT_LOGS"
  }
  depends_on = [aws_cloudwatch_log_resource_policy.es_logs]
}

resource "aws_kinesis_stream" "iit_logs" {
  name             = "${local.es_domain_name}-iit-logs"
  enforce_consumer_deletion = true
  shard_count      = var.kinesis_shards
  retention_period = 24

  shard_level_metrics = [
    "IncomingRecords",
    "IncomingBytes",
    "OutgoingBytes",
    "IteratorAgeMilliseconds",
    "OutgoingRecords",
    "ReadProvisionedThroughputExceeded",
    "WriteProvisionedThroughputExceeded"
  ]

  tags = {
    Environment = var.env
    Instance = local.es_domain_name
  }
}

# This policy needs to be attached to a SA role by the platform team
resource "aws_iam_policy" "iit_agents" {
  name        = "${local.es_domain_name}-nrm-agents"
  path        = "/"
  description = ""

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  policy = jsonencode({
    Version = "2012-10-17"
    "Statement": [
        {
            "Sid": "AllowAccessToKinesisStream",
            "Effect": "Allow",
            "Action": [
                "kinesis:PutRecord",
                "kinesis:PutRecords"
            ],
            "Resource": aws_kinesis_stream.iit_logs.arn
        }
    ]
  })
}

resource "aws_s3_bucket" "snapshots" {
  bucket = "${local.es_domain_name}-snapshot-${ data.aws_caller_identity.current.account_id }"
  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_acl" "snapshots" {
  bucket = aws_s3_bucket.snapshots.id
  acl    = "private"
}

resource "aws_iam_role" "snapshot_role" {
  name = "${local.es_domain_name}-opensearch-snapshot"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "opensearchservice.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          },
          ArnLike = {
            "aws:SourceArn": "arn:aws:es:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:domain/${local.es_domain_name}"
          }
        }
      },
    ]
  })
  inline_policy {
    name = "opensearch_snapshot_policy"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = ["s3:ListBucket"]
          Effect = "Allow"
          Resource = ["arn:aws:s3:::${aws_s3_bucket.snapshots.id}"]
        },
        {
          Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
          Effect = "Allow"
          Resource = ["arn:aws:s3:::${aws_s3_bucket.snapshots.id}/*"]
        },
      ]
    })
  }
}

/*
resource "aws_s3_bucket" "lambda_code" {
  bucket = "${local.es_domain_name}-lambda-code-${ data.aws_caller_identity.current.account_id }"
  acl    = "private"
  versioning {
    enabled = true
  }
  tags = {
    Environment = var.env
    Instance = local.es_domain_name
  }
}
*/

/*
resource "aws_s3_bucket_object" "lambda_stream_processing_code" {
  bucket = "${local.es_domain_name}-lambda-code-${ data.aws_caller_identity.current.account_id }"
  key    = "${local.es_domain_name}/event-stream-processing.zip"
  source = "../event-stream-processing/dist/event-stream-processing.zip"
  etag = filemd5("../event-stream-processing/dist/event-stream-processing.zip")
}
*/

/*
data "aws_s3_bucket_object" "lambda_stream_processing_code" {
  bucket = "nress-lambda-code-${var.env}-148a62ab607aead4cf48e909528347df"
  key    = "nress-${var.env}-event-stream-processing.zip"
  version_id = var.iit_lambda_code_bucket_key_version
}
*/

resource "aws_iam_role" "lambda_iit_agents" {
  name = "${local.es_domain_name}-lambda-iit-agents"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# custom/inline policy
resource "aws_iam_role_policy" "lambda_iit_agents_access_to_kinesis" {
  name = "access_to_kineis"
  role = aws_iam_role.lambda_iit_agents.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
          "Sid": "VisualEditor0",
          "Effect": "Allow",
          "Action": [
              "kinesis:SubscribeToShard",
              "kinesis:GetShardIterator",
              "kinesis:GetRecords",
              "kinesis:DescribeStream"
          ],
          "Resource": aws_kinesis_stream.iit_logs.arn
      },
      {
          "Sid": "VisualEditor1",
          "Effect": "Allow",
          "Action": [
              "kinesis:ListStreams",
              "kinesis:ListShards"
          ],
          "Resource": "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_iit_agents_basic_execution" {
  role       = aws_iam_role.lambda_iit_agents.id
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

data "aws_lambda_layer_version" "maxmind_geoip_db" {
  layer_name = "maxmind-geoip-db"
}

resource "aws_lambda_function" "lambda_iit_agents" {
  function_name = "${local.es_domain_name}-iit-agents"
  role          = aws_iam_role.lambda_iit_agents.arn
  runtime       = "nodejs14.x"
  handler       = "index.kinesisStreamHandler"
  memory_size   = 1024
  timeout       = 60
  #s3_bucket     = data.aws_s3_bucket_object.lambda_stream_processing_code.bucket
  #s3_key        = data.aws_s3_bucket_object.lambda_stream_processing_code.key
  #s3_object_version = data.aws_s3_bucket_object.lambda_stream_processing_code.version_id
  filename = "event-stream-processing.zip"
  source_code_hash = filebase64sha256("event-stream-processing.zip")
  layers = [data.aws_lambda_layer_version.maxmind_geoip_db.arn]
  publish       = false
  environment   {
    variables   = {
      "ES_URL"  = "https://${aws_opensearch_domain.es.endpoint}"
      "MAXMIND_DB_DIR"  = "/opt/nodejs/asset"
      "LOG_LEVEL" = "info"
    }
  }
}

resource "aws_lambda_event_source_mapping" "iit_logs_from_kinesis" {
  event_source_arn  = aws_kinesis_stream.iit_logs.arn
  function_name     = aws_lambda_function.lambda_iit_agents.arn
  parallelization_factor = 2
  starting_position = "LATEST"
  batch_size = 10000
  maximum_batching_window_in_seconds = 10
}

resource "null_resource" "es_configure" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    #working_dir = "../"
    #command = "echo %CD%"
    command = <<EOF
curl -sSL -o /tmp/node-v16.15.0-linux-x64.tar.gz https://nodejs.org/dist/v16.15.0/node-v16.15.0-linux-x64.tar.gz
mkdir /tmp/node
tar -xf /tmp/node-v16.15.0-linux-x64.tar.gz -C /tmp/node --strip-components=1
export PATH=/tmp/node/bin:$PATH
export AWS_REGION=ca-central-1
export OS_URL=apm.io.nrs.gov.bc.ca
export OS_DOMAIN=nress-prod
./workflow-cli/bin/run opensearch-sync
EOF
  environment = {
    AWS_ASSUME_ROLE = local.iam_role_arn
  }
  }
  depends_on = [aws_opensearch_domain.es]
}

/* The Elastic Search configuration may need to move to another module/workspace*/
/* it fails on the first deployment because terraform can't initialize the provider as ES endpoint doesn't yet exist*/

provider "elasticsearch" {
  url = "https://${aws_opensearch_domain.es.endpoint}"
  aws_region = "ca-central-1"
  healthcheck = false
  aws_assume_role_arn = local.iam_role_arn
}

resource "elasticsearch_opensearch_role" "iit_logs_writer" {
  role_name   = "iitd-logs-writer"
  description = "Logs writer role"

  cluster_permissions = ["indices:data/write/bulk","indices:admin/create", "create_index"]

  index_permissions {
    index_patterns  = ["iitd-*", "iit-*", "nrm-*"]
    allowed_actions = ["indices:data/write/bulk","indices:data/write/index","indices:data/write/bulk*","create_index"]
  }
  depends_on = [aws_opensearch_domain.es]
}

resource "elasticsearch_opensearch_roles_mapping" "iit_logs_writer_mapper" {
  role_name     = elasticsearch_opensearch_role.iit_logs_writer.id
  description   = "Mapping AWS IAM roles to ES role"
  backend_roles = [
    aws_iam_role.lambda_iit_agents.arn
  ]
}

resource "elasticsearch_opensearch_role" "nrm_read_all" {
  role_name   = "nrm-read-all"
  description = "NRM read role"
  cluster_permissions = [
    "cluster_composite_ops",
    "cluster:admin/opendistro/reports/definition/create",
    "cluster:admin/opendistro/reports/definition/update",
    "cluster:admin/opendistro/reports/definition/on_demand",
    "cluster:admin/opendistro/reports/definition/delete",
    "cluster:admin/opendistro/reports/definition/get",
    "cluster:admin/opendistro/reports/definition/list",
    "cluster:admin/opendistro/reports/instance/list",
    "cluster:admin/opendistro/reports/instance/get",
    "cluster:admin/opendistro/reports/menu/download"
  ]
  index_permissions {
    index_patterns  = ["iitd-*", "iit-*", "nrm-*"]
    allowed_actions = ["read", "indices:admin/resolve/index", "indices:data/read/get", "indices:monitor/settings/get"]
    masked_fields = ["source.ip", "client.ip"]
    field_level_security = ["~event.original", "~http.request.line"]
  }
  index_permissions {
    index_patterns  = [".kibana_*"]
    allowed_actions = ["kibana_all_read"]
  }
  tenant_permissions {
    tenant_patterns = ["*"]
    allowed_actions = ["kibana_all_read"]
  }
  depends_on = [aws_opensearch_domain.es]
}

resource "elasticsearch_opensearch_roles_mapping" "nrm_read_all_mapper" {
  role_name     = elasticsearch_opensearch_role.nrm_read_all.id
  description   = "Mapping KC role to ES role"
  backend_roles = ["nrm-read-all"]
}

module "tenant" {
  source = "./tenant-module"
  for_each = { for t in jsondecode(file("./tenants.json")): t.role_name => t }
  tenant = each.value
  depends_on = [aws_opensearch_domain.es]
}

resource "elasticsearch_opensearch_role" "nrm_security" {
  role_name   = "nrm-security"
  description = "NRM security role"
  cluster_permissions = [
    "cluster_composite_ops",
    "cluster:admin/opendistro/reports/definition/create",
    "cluster:admin/opendistro/reports/definition/update",
    "cluster:admin/opendistro/reports/definition/on_demand",
    "cluster:admin/opendistro/reports/definition/delete",
    "cluster:admin/opendistro/reports/definition/get",
    "cluster:admin/opendistro/reports/definition/list",
    "cluster:admin/opendistro/reports/instance/list",
    "cluster:admin/opendistro/reports/instance/get",
    "cluster:admin/opendistro/reports/menu/download"
  ]
  index_permissions {
    index_patterns  = ["iitd-*", "iit-*", "nrm-*"]
    allowed_actions = ["read", "indices:admin/resolve/index", "indices:data/read/get", "indices:monitor/settings/get"]
  }
  index_permissions {
    index_patterns  = [".kibana_*"]
    allowed_actions = ["kibana_all_read"]
  }
  tenant_permissions {
    tenant_patterns = ["infraops"]
    allowed_actions = ["kibana_all_read"]
  }
  depends_on = [aws_opensearch_domain.es]
}

resource "elasticsearch_opensearch_roles_mapping" "nrm_security_mapper" {
  role_name     = elasticsearch_opensearch_role.nrm_security.id
  description   = "Mapping KC role to ES role"
  backend_roles = ["nrm-security"]
}

resource "elasticsearch_opensearch_roles_mapping" "alerting_read_access" {
  role_name     = "alerting_read_access"
  description   = "Mapping KC role to ES role"
  backend_roles = ["alerting_read_access"]
}

resource "elasticsearch_opensearch_roles_mapping" "alerting_ack_alerts" {
  role_name     = "alerting_ack_alerts"
  description   = "Mapping KC role to ES role"
  backend_roles = ["alerting_ack_alerts"]
}

resource "elasticsearch_opensearch_roles_mapping" "alerting_full_access" {
  role_name     = "alerting_full_access"
  description   = "Mapping KC role to ES role"
  backend_roles = ["alerting_full_access"]
}

resource "elasticsearch_opensearch_roles_mapping" "anomaly_full_access" {
  role_name     = "anomaly_full_access"
  description   = "Mapping KC role to ES role"
  backend_roles = ["anomaly_full_access"]
}

resource "elasticsearch_opensearch_roles_mapping" "anomaly_read_access" {
  role_name     = "anomaly_read_access"
  description   = "Mapping KC role to ES role"
  backend_roles = ["anomaly_read_access"]
}

resource "elasticsearch_opensearch_roles_mapping" "all_access" {
  role_name     = "all_access"
  description   = "Mapping KC role to ES role"
  backend_roles = [
    "all_access",
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/BCGOV_prod_Automation_Admin_Role",
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/BCGOV_WORKLOAD_admin_umafubc9",
    "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/BCGOV_WORKLOAD_developer_umafubc9"
  ]
}

resource "elasticsearch_opensearch_roles_mapping" "manage_snapshots" {
  role_name     = "manage_snapshots"
  backend_roles = [
    aws_iam_role.snapshot_role.id
  ]
}

module "topic" {
  source = "./topic-module"
  for_each = { for t in jsondecode(file("./topics.json")): t.resourceId => t }
  topic = each.value
  aws_region_name = data.aws_region.current.name
  aws_account_id = data.aws_caller_identity.current.account_id
<<<<<<< HEAD
  es_domain_name = local.es_domain_name
=======
  aws_sns_role_id = aws_iam_role.opensearch_sns_role.id
<<<<<<< HEAD
>>>>>>> feat: add topic sqs and Opensearch destinations
=======
  es_domain_name = local.es_domain_name
>>>>>>> fix: missing
  depends_on = [aws_opensearch_domain.es]
}

resource "aws_iam_role" "opensearch_sns_role" {
  name = "opensearch_sns_${local.es_domain_name}"

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "es.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "aws:SourceAccount" = data.aws_caller_identity.current.account_id
          },
          ArnLike = {
            "aws:SourceArn": "arn:aws:es:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:domain/${local.es_domain_name}"
          }
        }
      },
    ]
  })

  inline_policy {
    name = "opensearch_sns_role_policy"

    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [
        {
          Action = ["sns:Publish"]
          Effect = "Allow"
          Resource = [
            for k, v in module.topic : v.topic_id
          ]
        }
      ]
    })
  }
}

module "destination" {
<<<<<<< HEAD
  source = "./topic-destination-module"
=======
  source = "./opensearch-destination-module"
>>>>>>> fix: split destination into module
  for_each = { for t in jsondecode(file("./topics.json")): t.resourceId => t }
  topic = each.value
  aws_region_name = data.aws_region.current.name
  aws_account_id = data.aws_caller_identity.current.account_id
<<<<<<< HEAD
  aws_sns_role_id = aws_iam_role.opensearch_sns_role.arn
=======
  aws_sns_role_id = aws_iam_role.opensearch_sns_role.id
>>>>>>> fix: split destination into module
  aws_sns_topic_id = module.topic[each.key].topic_id
  es_domain_name = local.es_domain_name
  depends_on = [aws_opensearch_domain.es]
}
