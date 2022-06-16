import {Command, Flags} from '@oclif/core';
import AwsSqsService from '../services/aws-sqs.service';

export default class AutomationMessage extends Command {
  static description = 'Automation message recieve tool';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static flags = {
    hostname: Flags.string({char: 'u', description: 'OpenSearch url', env: 'OS_URL', required: true}),
    domainName: Flags.string({char: 'd', description: 'OpenSearch Domain', env: 'OS_DOMAIN', required: true}),
    region: Flags.string({description: 'AWS region', env: 'AWS_REGION', required: true}),
    accessId: Flags.string({description: 'AWS access key id', env: 'AWS_ACCESS_KEY_ID', required: true}),
    accessKey: Flags.string({description: 'AWS secret access key', env: 'AWS_SECRET_ACCESS_KEY', required: true}),
    accountNumber: Flags.string({description: 'AWS account number', env: 'AWS_ACCOUNT_NUMBER', required: true}),
    arn: Flags.string({description: 'AWS ARN', env: 'AWS_ASSUME_ROLE'}),
  };

  public async run(): Promise<void> {
    const {flags} = await this.parse(AutomationMessage);
    // eslint-disable-next-line max-len
    const queueUrl = `https://sqs.${flags.region}.amazonaws.com/${flags.accountNumber}/${flags.domainName}-message-queue`;

    const service = new AwsSqsService(flags);
    await service.assumeIdentity(flags);
    const message = await service.receiveMessage(queueUrl);
    console.log(message);
  }
}
