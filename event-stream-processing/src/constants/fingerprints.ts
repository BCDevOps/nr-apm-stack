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
        hash: 'host.hostname,basename(log.file.path),event.sequence,event.original',
        docId: 'basename(log.file.path),event.sequence,event.hash',
        index: 'nrm-access-external-<%=YYYY.MM.DD=%>',
        timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
        apacheAccessLog: true,
        appClassification: true,
        deslash: true,
        environmentStandardize: true,
        urlExplode: true,
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
        hash: '@timestamp,host.name,event.squence,event.original',
        docId: 'labels.project,service.name,event.squence,event.hash',
        index: 'nrm-access-external-<%=YYYY.MM.DD=%>',
        environmentStandardize: true,
        geoIp: true,
        httpStatusOutcome: true,
        rename: 'labels.azp:source.user.id',
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
        hash: 'host.hostname,basename(log.file.path),event.sequence,event.original',
        docId: 'basename(log.file.path),event.sequence,event.hash',
        index: 'nrm-access-internal-<%=YYYY.MM.DD=%>',
        timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
        appClassification: true,
        deslash: true,
        environmentStandardize: true,
        urlExplode: true,
        httpStatusOutcome: true,
        tomcatLog: true,
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
        hash: 'host.hostname,basename(log.file.path),event.sequence,event.original',
        docId: 'basename(log.file.path),event.sequence,event.hash',
        index: 'nrm-tomcat-localhost-<%=YYYY.MM.DD=%>',
        timestampField: '@timestamp',
        timestampFormat: 'DD-MMM-YYYY HH:mm:ss.SSS',
        environmentStandardize: true,
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
        hash: 'host.hostname,basename(log.file.path),event.sequence,event.original',
        docId: 'basename(log.file.path),event.sequence,event.hash',
        index: 'nrm-tomcat-catalina-<%=YYYY.MM.DD=%>',
        timestampField: '@timestamp',
        timestampFormat: 'DD-MMM-YYYY HH:mm:ss.SSS',
        environmentStandardize: true,
        keyAsPath: true,
      },
    },
  },
  {
    name: FingerprintCategory.APP_LOGS,
    fingerprint: {
      event: {
        kind: 'event',
        category: 'web',
        dataset: 'application.log',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: 'host.hostname,basename(log.file.path),event.sequence,event.original',
        docId: 'basename(log.file.path),event.sequence,event.hash',
        index: 'nrm-app-generic-<%=YYYY.MM.DD=%>',
        timestampField: '@timestamp',
        timestampFormat: 'DD-MMM-YYYY HH:mm:ss.SSS',
        environmentStandardize: true,
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
        hash: 'host.hostname,basename(log.file.path),event.sequence,@timestamp',
        docId: 'basename(log.file.path),event.sequence,event.hash',
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
