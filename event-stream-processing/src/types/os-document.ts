import {KinesisStreamRecord} from 'aws-lambda';

export enum FingerprintName {
  APACHE_ACCESS_LOGS = 'APACHE_ACCESS_LOGS',
  VAULT_AUDIT_LOGS = 'VAULT_AUDIT_LOGS',
  METRICS = 'METRICS',
  UNKNOWN = 'UNKNOWN',
}

export interface OsDocumentFingerprint {
  name: FingerprintName;
  fingerprint: any;
  dataDefaults: {
    '@metadata': any;
  }
}

export interface OsDocument {
  fingerprint: OsDocumentFingerprint;
  record: KinesisStreamRecord;
  data: {
    [key: string]: any;
  };
  error: any;
}
