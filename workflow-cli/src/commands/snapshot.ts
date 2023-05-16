import {Args, Command, Flags} from '@oclif/core';
import OpenSearchSnapshotService from '../services/opensearch-snapshot.service';

const ACTION_SETUP = 'setup';
const ACTION_CREATE = 'create';

export default class Snapshot extends Command {
  static description = 'Snapshot setup and creation tool';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static args = {
    action: Args.string({
      name: 'action',
      required: true,
      description: 'Snapshot action',
      default: ACTION_CREATE,
      options: [ACTION_SETUP, ACTION_CREATE],
    }),
  };

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
    const {args} = await this.parse(Snapshot);
    const {flags} = await this.parse(Snapshot);
    const service = new OpenSearchSnapshotService();
    await service.assumeIdentity(flags);
    if (args.action === ACTION_SETUP) {
      await service.setupSnapshot(flags);
    } else if (args.action === ACTION_CREATE) {
      await service.createSnapshot(flags);
    } else {
      throw new Error('Illegal action');
    }
  }
}
