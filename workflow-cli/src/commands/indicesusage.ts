import {Command, Flags} from '@oclif/core';
import OpenSearchIndicesUsageService from '../services/opensearch-indicesusage.service';

const ACTION_SEARCH = '_search';

export default class Indicesusage extends Command {
  static description = 'Snapshot setup and creation tool';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static args = [
    {
      name: 'action',
      required: true,
      description: 'Search indices usage',
      default: ACTION_SEARCH,
    },
  ];

  static flags = {
    hostname: Flags.string({char: 'u', description: 'OpenSearch url', env: 'OS_URL', required: true}),
    domainName: Flags.string({char: 'd', description: 'OpenSearch Domain', env: 'OS_DOMAIN', required: true}),
    region: Flags.string({description: 'AWS region', env: 'AWS_REGION', required: true}),
    accessId: Flags.string({description: 'AWS access key id', env: 'AWS_ACCESS_KEY_ID', required: true}),
    accessKey: Flags.string({description: 'AWS secret access key', env: 'AWS_SECRET_ACCESS_KEY', required: true}),
    accountNumber: Flags.string({description: 'AWS account number', env: 'AWS_ACCOUNT_NUMBER', required: true}),
    arn: Flags.string({description: 'AWS ARN', env: 'AWS_ASSUME_ROLE'}),
    indicesname: Flags.string({description: 'indices name', env: 'AWS_ASSUME_ROLE', required: true}),
    fieldname: Flags.string({description: 'field name', env: 'AWS_ASSUME_ROLE', required: true}),
  };

  public async run(): Promise<void> {
    const {args} = await this.parse(Indicesusage);
    const {flags} = await this.parse(Indicesusage);
    const service = new OpenSearchIndicesUsageService();
    await service.assumeIdentity(flags);
    if (args.action === ACTION_SEARCH) {
      await service.getIndicesUsage(flags);
    } else {
      throw new Error('Illegal action');
    }
  }
}
