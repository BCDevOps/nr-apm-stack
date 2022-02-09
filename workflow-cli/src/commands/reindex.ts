import {Command, Flags} from '@oclif/core';
import ReindexService from '../services/reindex.service';

export default class Reindex extends Command {
  static description = 'Bulk reindex runner'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {
    hostname: Flags.string({char: 'u', description: 'OpenSearch url', env: 'OS_URL', required: true}),
    domainName: Flags.string({char: 'd', description: 'OpenSearch Domain', env: 'OS_DOMAIN', required: true}),
    region: Flags.string({description: 'AWS region', env: 'AWS_REGION', required: true}),
    accessId: Flags.string({description: 'AWS access key id', env: 'AWS_ACCESS_KEY_ID', required: true}),
    accessKey: Flags.string({description: 'AWS secret access key', env: 'AWS_SECRET_ACCESS_KEY', required: true}),
    arn: Flags.string({description: 'AWS ARN', env: 'AWS_ASSUME_ROLE'}),
    config: Flags.string({char: 'c', description: 'The configuration file name (without .json)',
      env: 'REINDEX_CONFIG_NAME', required: true}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(Reindex);

    const service = new ReindexService();
    await service.assumeIdentity(flags);
    await service.reindex(flags);
  }
}
