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
        hash: 'host.hostname,log.file.name,offset,event.original',
        docId: 'log.file.name,offset,event.hash',
        index: 'nrm-logs-access-<%=YYYY.MM.DD=%>',
        timestampField: 'event.original_timestamp',
        timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
        // Remove?
        apacheAccessLog: true,
        appClassification: true,
        deslash: true,
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
        dataset: 'express.access',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: '@timestamp,host.hostname,event.squence,event.original',
        docId: 'labels.project,service.name,event.squence,event.hash',
        index: 'nrm-logs-access-<%=YYYY.MM.DD=%>',
        geoIp: true,
        httpStatusOutcome: true,
        userAgent: true,
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
        hash: 'kinesis.eventID,log.file.path,log.file.offset,event.original',
        docId: 'host.hostname,log.file.offset,event.hash',
        index: 'nrm-logs-access-<%=YYYY.MM.DD=%>',
        timestampField: 'timestamp',
        timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
        // timestampFormat: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
        deslash: true,
        explodeHttpUrl: true,
        geoIp: true,
        httpStatusOutcome: true,
        ipv: 'clientIp,hostIp',
        joinKv: 'query',
        keyAsPath: true,
        rename: 'azp:client.user.id' +
          'contentLength:http.response.body.bytes' +
          'hostname:host.hostname' +
          'httpVersion:http.version' +
          'hostIp:host.ip' +
          'log:event.original' +
          'level:log.level' +
          'logFileOffset:log.file.offset' +
          'logFilePath:log.file.path' +
          'logStreamDate:event.created' +
          'method:http.request.method' +
          'namespace:orchestrator.namespace' +
          'path:url.path' +
          'product:service.name' +
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
    name: FingerprintCategory.TOMCAT_ACCESS_LOGS,
    fingerprint: {
      event: {
        kind: 'event',
        category: 'web',
        dataset: 'tomcat.access',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: 'host.hostname,log.file.name,offset,event.original',
        docId: 'log.file.name,offset,event.hash',
        index: 'nrm-logs-<!=labels.application=!>-access-<%=YYYY.MM.DD=%>',
        timestampField: 'event.original_timestamp',
        timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
        // Remove?
        appClassification: true,
        deslash: true,
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
    name: FingerprintCategory.TOMCAT_LOCALHOST_LOGS,
    fingerprint: {
      event: {
        kind: 'event',
        category: 'web',
        dataset: 'tomcat.localhost',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: 'host.hostname,log.file.name,offset,event.original',
        docId: 'log.file.name,offset,event.hash',
        index: 'nrm-logs-<!=labels.application=!>-<%=YYYY.MM.DD=%>',
        timestampField: 'event.original_timestamp',
        timestampFormat: 'DD-MMM-YYYY HH:mm:ss.SSS',
        // Remove?
        appClassification: true,
        deslash: true,
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
    name: FingerprintCategory.TOMCAT_CATALINA_LOGS,
    fingerprint: {
      event: {
        kind: 'event',
        category: 'web',
        dataset: 'tomcat.catalina',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: 'host.hostname,log.file.name,offset,event.original',
        docId: 'log.file.name,offset,event.hash',
        index: 'nrm-logs-<!=labels.application=!>-<%=YYYY.MM.DD=%>',
        timestampField: 'event.original_timestamp',
        timestampFormat: 'DD-MMM-YYYY HH:mm:ss.SSS',
        // Remove?
        appClassification: true,
        deslash: true,
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
        hash: 'service.name,response.data_json',
        docId: 'kinesis.eventID,event.hash',
        index: 'nrm-audit-vault-<%=YYYY.MM=%>',
      },
    },
  },
  {
    name: FingerprintCategory.METRICS,
    fingerprint: {
      event: {
        kind: 'event',
        category: ['configuration'],
        type: ['installation'],
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: 'host.hostname,log.file.name,offset,@timestamp',
        docId: 'log.file.name,offset,event.hash',
        index: 'nrm-deploy-<%=YYYY.MM=%>',
      },
    },
  },
  {
    name: FingerprintCategory.METRICS,
    fingerprint: {
      event: {
        kind: 'metric',
        dataset: 'host.cpu',
      },
    },
    dataDefaults: {
      '@metadata': {
        docId: 'kinesis.eventID',
        index: 'nrm-metrics-<%=YYYY.MM.DD=%>',
      },
    },
  },
  {
    name: FingerprintCategory.METRICS,
    fingerprint: {
      event: {
        kind: 'metric',
        dataset: 'host.memory',
      },
    },
    dataDefaults: {
      '@metadata': {
        docId: 'kinesis.eventID',
        index: 'nrm-metrics-<%=YYYY.MM.DD=%>',
      },
    },
  },
  {
    name: FingerprintCategory.METRICS,
    fingerprint: {
      event: {
        kind: 'metric',
        dataset: 'host.disk_usage',
      },
    },
    dataDefaults: {
      '@metadata': {
        docId: 'kinesis.eventID',
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
