import { injectable } from 'inversify';
import { Parser } from '../types/parser';
import lodash from 'lodash';
import moment from 'moment';
import { OsDocument } from '../types/os-document';
import { ParserError } from '../util/parser.error';

@injectable()
/**
 * Ensure timestamp is not outside allowed period. Durations are in ISO_8601 format.
 * See: https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
 * Tag: Support
 */
export class TimestampGuardParser implements Parser {
  /**
   * Returns true if metadata field timestampField and timestampFormat are present.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(
      document.data['@metadata'] && document.data['@metadata'].timestampGuard
    );
  }

  /**
   * Throw error if timestamp outside the guard
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const timestampGuard: string = document.data['@metadata'].timestampGuard;
    const [startStr, endStr = 'PT1M'] = timestampGuard.split(',');
    const timestamp = moment(lodash.get(document.data, '@timestamp'));
    if (
      !timestamp.isBetween(
        moment().subtract(moment.duration(startStr)),
        moment().add(moment.duration(endStr)),
      )
    ) {
      throw new ParserError(
        `Timestamp [${timestamp.toISOString()}] is outside guard [${startStr}, ${endStr}]`,
        'TimestampGuardParser',
        undefined,
        { skipDlq: true },
      );
    }
  }
}
