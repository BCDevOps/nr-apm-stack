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
        apacheAccessLog: true,
        hash: 'host.hostname,log.file.path,log.file.offset,record.message',
        docId: 'log.file.name,offset,event.hash',
        explodeHttpUrl: true,
        index: 'nrm-logs-access-<%=YYYY.MM.DD=%>',
        timestampField: 'apache.access.time',
        timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
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
        explodeHttpUrl: true,
        index: 'nrm-logs-access-<%=YYYY.MM.DD=%>',
        timestampField: 'apache.access.time',
        timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
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
