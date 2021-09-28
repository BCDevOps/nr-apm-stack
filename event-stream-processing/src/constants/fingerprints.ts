import {OsDocumentFingerprint, FingerprintName} from '../types/os-document';

export const FINGERPRINTS: OsDocumentFingerprint[] = [
  {
    name: FingerprintName.APACHE_ACCESS_LOGS,
    fingerprint: {
      event: {
        kind: 'event',
        category: 'web',
        dataset: 'apache.access', // node.css.http
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: 'host.hostname,log.file.path,log.file.offset,record.message',
        docid: 'log.file.name,offset,event.hash',
        index: 'nrm-logs-access-<%=YYYY.MM.DD=%>',
        timestampField: 'apache.access.time',
        timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
      },
    },
  },
  {
    name: FingerprintName.VAULT_AUDIT_LOGS,
    fingerprint: {
      event: {
        kind: 'event',
        category: 'web',
        dataset: 'vault.audit',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: 'host.hostname,log.file.path,log.file.offset,record.message',
        docid: 'log.file.name,offset,event.hash',
        index: 'nrm-audit-vault-',
      },
    },
  },
  {
    name: FingerprintName.METRICS,
    fingerprint: {
      event: {
        kind: 'metric',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: 'host.hostname,log.file.path,log.file.offset,record.message',
        docid: 'log.file.name,offset,event.hash',
        index: 'nrm-metrics-',
        keyAsPath: true,
      },
    },
  },
  // Unknown should be last
  {
    name: FingerprintName.UNKNOWN,
    fingerprint: null,
    dataDefaults: {
      '@metadata': {
        hash: 'kinesis.eventID,kinesis.sequenceNumber',
        docid: 'kinesis.eventID,event.hash',
      },
    },
  },
];
