import {KinesisStreamRecord} from 'aws-lambda';

export enum FingerprintCategory {
  APACHE_ACCESS_LOGS = 'APACHE_ACCESS_LOGS',
  TOMCAT_ACCESS_LOGS = 'TOMCAT_ACCESS_LOGS',
  TOMCAT_LOCALHOST_LOGS = 'TOMCAT_LOCALHOST_LOGS',
  TOMCAT_CATALINA_LOGS = 'TOMCAT_CATALINA_LOGS',
  VAULT_AUDIT_LOGS = 'VAULT_AUDIT_LOGS',
  METRICS = 'METRICS',
  UNKNOWN = 'UNKNOWN',
}

export interface OsDocumentData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface OsDocumentFingerprint {
  name: FingerprintCategory;
  fingerprint: OsDocumentData | null;
  dataDefaults: {
    '@metadata': OsDocumentData;
  }
}

export interface OsDocument {
  fingerprint: OsDocumentFingerprint;
  record: KinesisStreamRecord;
  id: string | null;
  index: string | null;
  type: string;
  data: OsDocumentData;
  error: any;
}
