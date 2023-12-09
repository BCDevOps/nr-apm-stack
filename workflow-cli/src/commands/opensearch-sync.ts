import {Command, Flags} from '@oclif/core';
import OpenSearchMonitorService from '../services/opensearch-monitor.service';
import AwsService from '../services/aws.service';
import OpenSearchDomainService from '../services/opensearch-domain.service';
import OpenSearchPolicyService from '../services/opensearch-policy.service';
import OpenSearchTemplateService from '../services/opensearch-template.service';

export default class OpenSearchSync extends Command {
  static description = 'Sync OpenSearch settings';

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ];

  static flags = {
    hostname: Flags.string({char: 'u', description: 'OpenSearch url', env: 'OS_URL', required: true}),
    domainName: Flags.string({char: 'd', description: 'OpenSearch Domain', env: 'OS_DOMAIN', required: true}),
    region: Flags.string({description: 'AWS region', env: 'AWS_REGION', required: true}),
    accessId: Flags.string({description: 'AWS access key id', env: 'AWS_ACCESS_KEY_ID', required: true}),
    accessKey: Flags.string({description: 'AWS secret access key', env: 'AWS_SECRET_ACCESS_KEY', required: true}),
    arn: Flags.string({description: 'AWS ARN', env: 'AWS_ASSUME_ROLE'}),
  };

  public async run(): Promise<void> {
    const {flags} = await this.parse(OpenSearchSync);

    await AwsService.assumeIdentity(flags);

    const domainService = new OpenSearchDomainService();
    const policyService = new OpenSearchPolicyService();
    const templateService = new OpenSearchTemplateService();
    const monitorService = new OpenSearchMonitorService();

    await domainService.getDomain(flags);
    await templateService.syncComponentTemplates(flags);
    await policyService.syncStateManagementPolicy(flags);
    await monitorService.syncMonitors(flags);
  }
}
