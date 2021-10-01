import {OsDocumentFingerprint, FingerprintName} from '../types/os-document';

export const FINGERPRINTS: OsDocumentFingerprint[] = [
  {
    name: FingerprintName.APACHE_ACCESS_LOGS,
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
      },
    },
  },
  {
    name: FingerprintName.APACHE_ACCESS_LOGS,
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
        hash: 'host.hostname,response.data_json',
        docId: 'kinesis.eventID,event.hash',
        index: 'nrm-audit-vault-<%=YYYY.MM.DD=%>',
      },
    },
  },
  {
    name: FingerprintName.METRICS,
    fingerprint: {
      event: {
        kind: 'metric',
        dataset: 'system.cpu',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: '',
        docId: 'kinesis.eventID,',
        index: 'nrm-metrics-<%=YYYY.MM.DD=%>',
        keyAsPath: true,
        rename: 'user_p,system.cpu.user.pct:system_p,system.cpu.system.pct:cpu_p,system.cpu.total.pct',
      },
    },
  },
  {
    name: FingerprintName.METRICS,
    fingerprint: {
      event: {
        kind: 'metric',
        dataset: 'system.memory',
      },
    },
    dataDefaults: {
      '@metadata': {
        hash: '',
        docId: 'kinesis.eventID,',
        index: 'nrm-metrics-<%=YYYY.MM.DD=%>',
        keyAsPath: true,
        rename: 'user_p,system.cpu.user.pct:system_p,system.cpu.system.pct:cpu_p,system.cpu.total.pct',
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
        docId: 'kinesis.eventID,event.hash',
      },
    },
  },
];
