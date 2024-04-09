import { Container } from 'inversify';
import { TYPES } from './inversify.types';
import { BrokerApi } from './broker/broker.api';
import OpenSearchController from './controller/opensearch.controller';
import LambdaAssetDownloadService from './services/lambda-asset-download.service';
import OpenSearchDomainService from './services/opensearch-domain.service';
import OpenSearchMonitorService from './services/opensearch-monitor.service';
import OpenSearchNotificationsService from './services/opensearch-notifications.service';
import OpenSearchPolicyService from './services/opensearch-policy.service';
import OpenSearchTemplateService from './services/opensearch-template.service';

const vsContainer = new Container();
// Controllers
vsContainer
  .bind<OpenSearchController>(TYPES.OpenSearchController)
  .to(OpenSearchController);
// Services
vsContainer.bind<BrokerApi>(TYPES.BrokerApi).to(BrokerApi);
vsContainer
  .bind<LambdaAssetDownloadService>(TYPES.LambdaAssetDownloadService)
  .to(LambdaAssetDownloadService);
vsContainer
  .bind<OpenSearchDomainService>(TYPES.OpenSearchDomainService)
  .to(OpenSearchDomainService);
vsContainer
  .bind<OpenSearchTemplateService>(TYPES.OpenSearchTemplateService)
  .to(OpenSearchTemplateService);
vsContainer
  .bind<OpenSearchPolicyService>(TYPES.OpenSearchPolicyService)
  .to(OpenSearchPolicyService);
vsContainer
  .bind<OpenSearchMonitorService>(TYPES.OpenSearchMonitorService)
  .to(OpenSearchMonitorService);
vsContainer
  .bind<OpenSearchNotificationsService>(TYPES.OpenSearchNotificationsService)
  .to(OpenSearchNotificationsService);

export { vsContainer };

/**
 * Bind Broker api to the vs container
 * @param basePath The base api url
 * @param token The Jira username
 */
export function bindBroker(apiUrl: string, token: string | undefined): void {
  vsContainer.bind<string>(TYPES.BrokerApiUrl).toConstantValue(apiUrl);
  if (token) {
    vsContainer.bind<string>(TYPES.BrokerToken).toConstantValue(token);
  }
}
