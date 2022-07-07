import {Command, Flags} from '@oclif/core';
import OpenSearchSnapshotService from '../services/opensearch-snapshot.service';

export default class Snapshot extends Command {
  static description = 'Snapshot setup and creation tool';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static args = [
    {
      name: 'setup',
      required: false,
      description: 'set up snapshot',
    },
    {
      name: 'create',
      required: false,
      description: 'create snapshot',
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
  };

  public async run(): Promise<void> {
    const {args} = this.parse(Snapshot);
    const {flags} = await this.parse(Snapshot);
    const getTimeStamp = function() {
      const date = new Date();
      const day = `0${String(date.getDate()).slice(-2)}`;
      const month = `0${String(date.getMonth()+1).slice(-2)}`;
      const year = `${String(date.getFullYear())}`;
      const hours = `${String(date.getHours())}`;
      const minutes = `${String(date.getMinutes())}`;
      const seconds = `${String(date.getSeconds())}`;
      return `${year}.${month}.${day}t${hours}.${minutes}.${seconds}`;
    };
    const timeStamp = getTimeStamp();
    const service = new OpenSearchSnapshotService();
    await service.assumeIdentity(flags);
    if (args.setup) {
      await service.setupSnapshot(flags);
    }
    if (args.create) {
      await service.createSnapshot(flags, timeStamp);
    }
  }
}
