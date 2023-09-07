# Onboarding Process
## Onboarding Server Metrics to OpenSearch
Configure the new server in Github Repo [nr-funbucks](https://github.com/bcgov-nr/nr-funbucks/tree/main/config/server)

Example:

- Linux: [backup.json](https://github.com/bcgov-nr/nr-funbucks/blob/main/config/server/backup.json)

    ```
    {
      "address": "backup.dmz",
      "proxy": "http://test-forwardproxy.nrs.bcgov:23128",
      "logsProxyDisabled": "true",
      "os": "linux",
      "os_variant": "rhel7",
      "vault_cd_user_field": "username_lowercase",
      "vault_cd_pass_field": "password",
      "vault_cd_path": "groups/appdelivery/jenkins-isss-cdua",
      "apps": [
        {"id": "cpu", "type": "metric_host_cpu", "context": {}},
        {"id": "disk", "type": "metric_host_disk", "context": {}},
        {"id": "disk_named", "type": "metric_host_disk_named", "context": {}},
        {"id": "memory", "type": "metric_host_memory", "context": {}},
        {"id": "network", "type": "metric_host_network", "context": {}},
        {settings for logs}
      ],
      "context": {}
    }
    ```

- Windows: [stress.json](https://github.com/bcgov-nr/nr-funbucks/blob/main/config/server/stress.json)

    ```
    {
      "address": "stress.dmz",
      "proxy": "http://test-forwardproxy.nrs.bcgov:23128",
      "logsProxyDisabled": "true",
      "os": "windows",
      "vault_cd_user_field": "username_domainless",
      "vault_cd_pass_field": "password",
      "vault_cd_path": "groups/appdelivery/oraapp_imborapp",
      "apps": [settings for logs],
      "context": {}
    }
    ```

| FingerprintCategory | event.kind | event.dataset   | index                     |
|---------------------|------------|-----------------|---------------------------|
| METRICS             | metric     | host.cpu        | nrm-metrics-*             |
| METRICS             | metric     | host.memory     | nrm-metrics-*             |
| METRICS             | metric     | host.disk_usage | nrm-metrics-*             |
| METRICS             | metric     | host.network    | nrm-metrics-*             |
| METRICS             | metric     | process.info    | nrm-metrics-*             |
| METRICS             | metric     | host.proc       | nrm-metrics-*             |
| PIPELINE            | metric     | pipeline.batch  | nrm-pipeline-opensearch-* |

## Onboarding Logs into OpenSearch

- event.kind: 'event'
- event.category: 'web'
- Mappings on Fingerprint Category and event.dataset

| Fingerprint Category   | event.dataset          | service.name | index                  |
|------------------------|------------------------|--------------|------------------------|
| APACHE_ACCESS_LOGS     | apache.access          |              | nrm-access-external-*  |
| APACHE_ACCESS_LOGS     | apache.access.internal |              | nrm-access-internal-*  |
| WIN_IIS_ACCESS_LOGS    | iis.access             |              | nrm-access-external-*  |
| WIN_IIS_ACCESS_LOGS    | iis.access.internal    |              | nrm-access-internal-*  |
| HTTP_ACCESS_LOGS       | express.access         |              | nrm-access-external-*  |
| HTTP_ACCESS_LOGS       | generic.access         |              | nrm-access-external-*  |
| WSO2_ACCESS_LOGS       | wso2.access            |              | nrm-access-internal-*  |
| TOMCAT_ACCESS_LOGS     | tomcat.access          |              | nrm-access-internal-*  |
| TOMCAT_LOCALHOST_LOGS  | tomcat.localhost       |              | nrm-tomcat-localhost-* |
| TOMCAT_CATALINA_LOGS   | tomcat.catalina        |              | nrm-tomcat-catalina-*  |
| APP_LOGS               | application.log        | fmeserver    | nrm-app-generic-*      |
| APP_LOGS               | application.log        | knox         | nrm-app-generic-*      |
| APP_LOGS               | wso2.carbon            | api-manager  | nrm-app-generic-*      |
| APP_LOGS               | application.log        |              | nrm-app-generic-*      |
| APP_LOGS               | application.log.utc    |              | nrm-app-generic-*      |
| MQ_AUDIT_LOGS          | mq.audit               |              | nrm-audit-mq-*         |
| VAULT_AUDIT_LOGS       | vault.audit            |              | nrm-audit-vault-*      |
| BROKER_AUDIT_LOGS      | broker.audit           |              | nrm-audit-broker-*     |

After configuring and deploying logs part of the server with Fluent Bit via Github Repo [nr-funbucks](https://github.com/bcgov-nr/nr-funbucks/tree/main/config/server) asssociated with correct dataset, the logs including access, localhost and application will be shown in the OpenSearch.

Documents about configuration for Fluent Bit is in [nr-funbucks](./fluentbit.md).

## Verification Steps

- Login [OpenSearch](https://apm.io.nrs.gov.bc.ca/_dashboards)
- menu -> Discover
- choose correct indices from dropdown list
- type search string in the search bar. For example: host.hostname: stress
