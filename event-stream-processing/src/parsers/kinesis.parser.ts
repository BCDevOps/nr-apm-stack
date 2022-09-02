import {inject, injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import {TYPES} from '../inversify.types';
import {DateAndTimeService} from '../shared/date-and-time.service';
import {OsDocument} from '../types/os-document';

@injectable()
/**
 * Set kinesis related fields
 *
 * Tag: Meta
 */
export class KinesisParser implements Parser {
  constructor(
    @inject(TYPES.DateAndTimeService) private dateAndTime: DateAndTimeService,
  ) {}

  /**
   * Returns true always
   * @returns
   */
  matches(): boolean {
    return true;
  }

  /**
   * Set kinesis related fields
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const debug = document.data['@metadata']?.kinesis === 'debug';
    lodash.set(document.data, 'event.ingested', this.dateAndTime.now().toISOString(true));
    lodash.set(document.data, 'kinesis.eventID', document.record.eventID);
    if (debug) {
      lodash.set(document.data, 'kinesis.approximateArrivalTimestamp',
        document.record.kinesis.approximateArrivalTimestamp);
      lodash.set(document.data, 'kinesis.partitionKey', document.record.kinesis.partitionKey);
      lodash.set(document.data, 'kinesis.sequenceNumber', document.record.kinesis.sequenceNumber);
    }
  }
}
