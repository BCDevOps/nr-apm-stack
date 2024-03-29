import {Command, Flags} from '@oclif/core';
import OpenSearchNotificationsService from '../services/opensearch-notifications.service';
import AwsService from '../services/aws.service';
import OpenSearchDomainService from '../services/opensearch-domain.service';

export default class OpenSearchNotificationChannel extends Command {
  static description = 'Create OneTeam Priority SNS notification channel in OpenSearch';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static flags = {
    hostname: Flags.string({char: 'u', description: 'OpenSearch url', env: 'OS_URL', required: true}),
    domainName: Flags.string({char: 'd', description: 'OpenSearch Domain', env: 'OS_DOMAIN', required: true}),
    accessId: Flags.string({description: 'AWS access key id', env: 'AWS_ACCESS_KEY_ID', required: true}),
    accessKey: Flags.string({description: 'AWS secret access key', env: 'AWS_SECRET_ACCESS_KEY', required: true}),
    arn: Flags.string({description: 'AWS ARN', env: 'AWS_ASSUME_ROLE'}),
    accountNumber: Flags.string({
      description: 'AWS account number', env: 'AWS_ACCOUNT_NUMBER', required: true}),
    region: Flags.string({
      description: 'AWS region', env: 'AWS_REGION', required: true}),
    configId: Flags.string({
      description: 'Configuration ID for notifications channel', default: 'oneteam-priority', required: true}),
    configIdName: Flags.string({
      description: 'Configuration name for notifications channel', default: 'oneteam-priority', required: true}),
    configNameLong: Flags.string({
      description: 'Configuration long name for notifications channel',
      default: 'OneTeam Priority SNS', required: true}),
    configDescription: Flags.string({
      description: 'Configuration description for notifications channel',
      default: 'SNS destination created by nr-apm-stack workflow cli', required: true}),
    configType: Flags.string({
      description: 'Configuration type for notifications channel', default: 'sns', required: true}),
    isEnabled: Flags.boolean({
      description: 'Enable notifications channel', default: true, required: true}),
    configTopicArnId: Flags.string({
      description: 'Configuration topic arn ID for notifications channel',
      default: `nress-prod-oneteam-priority`, required: true}),
    configRoleArnId: Flags.string({
      description: 'Configuration role arn ID for notifications channel',
      default: `opensearch_sns_nress-prod`, required: true}),
  };

  public async run(): Promise<void> {
    const {flags} = await this.parse(OpenSearchNotificationChannel);
    await AwsService.assumeIdentity(flags);
    const service = new OpenSearchNotificationsService();
    const domainService = new OpenSearchDomainService();

    await domainService.getDomain(flags);
    await service.createSnsChannel(flags);
  }
}
