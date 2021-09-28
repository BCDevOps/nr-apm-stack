import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import moment from 'moment';
import {OsDocument} from '../types/os-document';

@injectable()
/**
 * Apply index to document
 */
export class IndexNameParser implements Parser {
  /**
   * Match documents without an index
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !document.data._index;
  }

  /**
   * Apply index to document
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const timestamp = lodash.get(document.data, '@timestamp');
    const index: string = lodash.get(document.data, '@metadata.index');
    if (!index) {
      throw new Error('Could not map event to an index');
    }
    if (lodash.isNil(timestamp)) {
      throw new Error('@timestamp field value has not been defined');
    }
    const tsMomement = moment(timestamp);

    const indexFormat: string = index.replace(/\<\%\=[^\=]+=\%\>/gm, (match: string) => {
      if (match.startsWith('<%=')) {
        return tsMomement.format(match.substring(3, match.length - 3));
      }
      throw new Error(`Unexpected formatting: ${match}`);
    });
    document.data._index = indexFormat;
  }
}
