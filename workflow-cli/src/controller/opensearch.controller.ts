import { inject, injectable } from 'inversify';
import OpenSearchDomainService from '../services/opensearch-domain.service';
import OpenSearchMonitorService from '../services/opensearch-monitor.service';
import OpenSearchNotificationsService from '../services/opensearch-notifications.service';
import OpenSearchPolicyService from '../services/opensearch-policy.service';
import OpenSearchTemplateService from '../services/opensearch-template.service';
import { TYPES } from '../inversify.types';

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
  ) {}

  public async sync(flags: any) {
    await this.domainService.getDomain(flags);
    await this.templateService.syncComponentTemplates(flags);
    await this.policyService.syncStateManagementPolicy(flags);
    await this.notificationService.sync(flags);
    await this.monitorService.sync(flags);
  }
}
