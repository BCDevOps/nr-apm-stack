/* eslint-disable @typescript-eslint/no-explicit-any */
import {SQSClient, ReceiveMessageCommand} from '@aws-sdk/client-sqs';

import AwsService from './aws.service';

export interface settings {
  domainName: string;
  region: string;
  accessId: string;
  accessKey: string;
  accountNumber: string;
  arn: string | undefined;
}

export default class AwsSqsService extends AwsService {
  private client: SQSClient;
  constructor(settings: settings) {
    super();
    this.client = new SQSClient({region: settings.region});
  }

  public receiveMessage(queueUrl: string): Promise<any> {
    const cmd = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
    });
    return this.client.send(cmd);
  }
}
