import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import moment from 'moment';
import {OsDocument} from '../types/os-document';


@injectable()
/**
 * Parse timestamp from field
 */
export class TimestampFieldParser implements Parser {
  /**
   * Returns true if metadata field timestampField and timestampFormat are present.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] &&
      document.data['@metadata'].timestampField &&
      document.data['@metadata'].timestampFormat);
  }

  /**
   * Parse timestamp from field
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const fieldName: string = document.data['@metadata'].timestampField;
    const tsFormat: string = document.data['@metadata'].timestampFormat;
    const value: string = lodash.get(document.data, fieldName);

    if (value) {
      // lodash.set(record.data, fieldName, value)
      const date = moment(value, tsFormat);
      if (date.isValid()) {
        lodash.set(document.data, '@timestamp', date.toISOString(true));
      } else {
        throw new Error(`Invalid Date: ${value}`);
      }
    } else {
      throw new Error(`No value set for timestamp: ${fieldName}`);
    }
  }
}
