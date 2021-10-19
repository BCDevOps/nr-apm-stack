import {OsDocumentFingerprint, FingerprintCategory} from '../types/os-document';

export const FINGERPRINTS: OsDocumentFingerprint[] = [
  {
    name: FingerprintCategory.APACHE_ACCESS_LOGS,
    fingerprint: {
      event: {
        kind: 'event',
        category: 'web',
        dataset: 'apache.access',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: 'host.hostname,log.file.path,log.file.offset,record.message',
        docId: 'log.file.name,offset,event.hash',
        index: 'nrm-logs-access-<%=YYYY.MM.DD=%>',
        timestampField: 'apache.access.time',
        timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
        // Remove?
        apacheAccessLog: true,
        appClassification: true,
        deslash: true,
        fileAttributes: true,
        explodeHttpUrl: true,
        geoIp: true,
        httpStatusOutcome: true,
        threatPhp: true,
        userAgent: true,
        keyAsPath: true,
      },
    },
  },
  {
    name: FingerprintCategory.APACHE_ACCESS_LOGS,
    fingerprint: {
      event: {
        kind: 'event',
        category: 'web',
        dataset: 'node.css.http',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: 'host.hostname,log.file.path,log.file.offset,record.message',
        docId: 'log.file.name,offset,event.hash',
        index: 'nrm-logs-access-<%=YYYY.MM.DD=%>',
        timestampField: 'apache.access.time',
        timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
        // Remove?
        deslash: true,
        fileAttributes: true,
        explodeHttpUrl: true,
        geoIp: true,
        httpStatusOutcome: true,
        ipv: 'clientIp,hostIp',
        joinKv: 'query',
        keyAsPath: true,
        rename: 'azp:client.user.id' +
          'contentLength:http.response.body.bytes' +
          'hostname:kubernetes.pod_name' +
          'httpVersion:http.version' +
          'hostIp:kubernetes.pod_ip' +
          'log:event.original' +
          'level:log.level' +
          'logFileOffset:log.file.offset' +
          'logFilePath:log.file.path' +
          'logStreamDate:event.created' +
          'method:http.request.method' +
          'namespace:kubernetes.namespace_name' +
          'path:url.path' +
          'product:labels.application' +
          'query:url.query' +
          'responseTime:http.response.time' +
          'statusCode:http.response.status_code' +
          'userAgent:user_agent.original',
        threatPhp: true,
        userAgent: true,
      },
    },
  },
  {
    name: FingerprintCategory.VAULT_AUDIT_LOGS,
    fingerprint: {
      event: {
        kind: 'event',
        category: 'web',
        dataset: 'vault.audit',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: 'host.hostname,response.data_json',
        docId: 'kinesis.eventID,event.hash',
        index: 'nrm-audit-vault-<%=YYYY.MM.DD=%>',
      },
    },
  },
  {
    name: FingerprintCategory.METRICS,
    fingerprint: {
      event: {
        kind: 'metric',
        dataset: 'system.cpu',
      },
    },
    dataDefaults: {
      '@metadata': {
        docId: 'kinesis.eventID,kinesis.sequenceNumber',
        index: 'nrm-metrics-<%=YYYY.MM.DD=%>',
      },
    },
  },
  {
    name: FingerprintCategory.METRICS,
    fingerprint: {
      event: {
        kind: 'metric',
        dataset: 'system.memory',
      },
    },
    dataDefaults: {
      '@metadata': {
        docId: 'kinesis.eventID,kinesis.sequenceNumber',
        index: 'nrm-metrics-<%=YYYY.MM.DD=%>',
      },
    },
  },
  // Unknown should be last
  {
    name: FingerprintCategory.UNKNOWN,
    fingerprint: null,
    dataDefaults: {
      '@metadata': {
        docId: 'kinesis.eventID,event.hash',
      },
    },
  },
];
