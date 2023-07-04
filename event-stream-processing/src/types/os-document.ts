import {KinesisStreamRecord} from 'aws-lambda';

export enum FingerprintCategory {
  APACHE_ACCESS_LOGS = 'APACHE_ACCESS_LOGS',
  APP_LOGS = 'APP_LOGS',
  BROKER_AUDIT_LOGS = 'BROKER_AUDIT_LOGS',
  HTTP_ACCESS_LOGS = 'HTTP_ACCESS_LOGS',
  METRICS = 'METRICS',
  MQ_AUDIT_LOGS = 'MQ_AUDIT_LOGS',
  PIPELINE = 'PIPELINE',
  TOMCAT_ACCESS_LOGS = 'TOMCAT_ACCESS_LOGS',
  TOMCAT_CATALINA_LOGS = 'TOMCAT_CATALINA_LOGS',
  TOMCAT_LOCALHOST_LOGS = 'TOMCAT_LOCALHOST_LOGS',
  VAULT_AUDIT_LOGS = 'VAULT_AUDIT_LOGS',
  WSO2_ACCESS_LOGS = 'WSO2_ACCESS_LOGS',
  WIN_IIS_ACCESS_LOGS = 'WIN_IIS_ACCESS_LOGS',
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
  dataExtractedTimestamp?: string;
}

export class PipelineProcessingFailure<T> {
  constructor(public source: T, public message: string) {}
}

export class KinesisStreamRecordDecodeFailure extends PipelineProcessingFailure<KinesisStreamRecord> {}
export class OsDocumentProcessingFailure extends PipelineProcessingFailure<OsDocument> {}
export class OsDocumentCommitFailure extends PipelineProcessingFailure<OsDocument> {}
// eslint-disable-next-line max-len
export type PipelineObject = OsDocument|KinesisStreamRecordDecodeFailure|OsDocumentProcessingFailure|OsDocumentCommitFailure;
export class OsDocumentPipeline {
  documents: OsDocument[] = [];
  failures: Array<KinesisStreamRecordDecodeFailure|OsDocumentProcessingFailure|OsDocumentCommitFailure> = [];
}
