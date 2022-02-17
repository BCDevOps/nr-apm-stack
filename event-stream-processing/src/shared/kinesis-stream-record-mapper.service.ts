import {KinesisStreamRecord} from 'aws-lambda';
import {inject, injectable} from 'inversify';
import lodash from 'lodash';
import {FINGERPRINTS, FINGERPRINT_UNKNOWN} from '../constants/fingerprints';
import {TYPES} from '../inversify.types';
import {OsDocument, OsDocumentData, OsDocumentFingerprint} from '../types/os-document';
import {SubsetService} from './subset.service';

@injectable()
export class KinesisStreamRecordMapperService {
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.SubsetService) private subset: SubsetService,
  ) {}

  /**
   * Converts a KinesisStreamRecord to an OsDocument
   * @param record The record to convert
   * @returns
   */
  public toOpensearchDocument(record: KinesisStreamRecord): OsDocument {
    const data = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('utf8'));
    return {
      fingerprint: FINGERPRINT_UNKNOWN,
      id: null,
      index: null,
      type: '_doc',
      data,
      record,
      error: null,
    };
  }

  /**
   * Matches the document to a fingerprint and modifies the data with any defaults from the fingerprint.
   * @param document The document to modify
   * @returns
   */
  public toFingerprintedDocument(document: OsDocument): OsDocument {
    const fingerprint = this.fingerprintData(document.data);
    lodash.defaultsDeep(document.data, fingerprint.dataDefaults);
    document.fingerprint = fingerprint;
    return document;
  }

  public fingerprintData(data: OsDocumentData): OsDocumentFingerprint {
    return FINGERPRINTS.find((fp) => {
      if (fp.fingerprint === null) {
        return fp;
      }
      if (this.subset.isSubset(data, fp.fingerprint)) {
        return fp;
      }
    }) as OsDocumentFingerprint; // Will always match last "unknown" fingerprint
  }
}
