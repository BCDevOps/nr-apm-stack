import {KinesisStreamRecord} from 'aws-lambda';
import {inject, injectable} from 'inversify';
import lodash from 'lodash';
import {FINGERPRINTS} from '../constants/fingerprints';
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
   *
   * @param record
   * @returns
   */
  public toOpensearchDocument(record: KinesisStreamRecord): OsDocument {
    const data = JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('utf8'));
    const fingerprint = this.fingerprintData(data);
    lodash.defaultsDeep(data, fingerprint.dataDefaults);
    return {
      fingerprint,
      id: null,
      index: null,
      type: '_doc',
      data,
      record,
      error: null,
    };
  }

  public fingerprintData(data: OsDocumentData): OsDocumentFingerprint {
    return FINGERPRINTS.find((fp) => {
      if (fp.fingerprint === null) {
        return fp;
      }
      if (this.subset.isSubset(data, fp)) {
        return fp;
      }
    }) as OsDocumentFingerprint; // Will always match last "unknown" fingerprint
  }
}
