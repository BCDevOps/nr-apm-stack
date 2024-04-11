import { inject, injectable } from 'inversify';
import OpenSearchDomainService from '../services/opensearch-domain.service';
import OpenSearchMonitorService from '../services/opensearch-monitor.service';
import OpenSearchNotificationsService from '../services/opensearch-notifications.service';
import OpenSearchPolicyService from '../services/opensearch-policy.service';
import OpenSearchTemplateService from '../services/opensearch-template.service';
import { TYPES } from '../inversify.types';
import VaultApi from '../vault/vault.api';

@injectable()
/**
 * Vault approle controller.
 */
export default class OpenSearchController {
  constructor(
    @inject(TYPES.OpenSearchDomainService)
    private domainService: OpenSearchDomainService,
    @inject(TYPES.OpenSearchTemplateService)
    private templateService: OpenSearchTemplateService,
    @inject(TYPES.OpenSearchPolicyService)
    private policyService: OpenSearchPolicyService,
    @inject(TYPES.OpenSearchMonitorService)
    private monitorService: OpenSearchMonitorService,
    @inject(TYPES.OpenSearchNotificationsService)
    private notificationService: OpenSearchNotificationsService,
    @inject(TYPES.VaultApi)
    private vault: VaultApi,
  ) {}

  public async sync(flags: any) {
    await this.domainService.getDomain(flags);
    console.log('======= Template Sync');
    await this.templateService.syncComponentTemplates(flags);

    console.log('======= Policy Sync');
    await this.policyService.syncStateManagementPolicy(flags);

    console.log('======= Notification Sync');
    await this.notificationService.sync(
      flags,
      (
        await this.vault.read(
          '/v1/apps/data/prod/apm/apm-opensearch-aws/github',
        )
      ).data.data,
    );

    // console.log('======= Monitor Sync');
    // await this.monitorService.sync(flags);
  }
}
