import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import {OsDocument} from '../types/os-document';

@injectable()
/**
 * Parse keys as paths
 */
export class KeyAsPathParser implements Parser {
  /**
   * Returns true if metadata field keyAsPath is true.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].keyAsPath);
  }

  /**
   * Parse keys as paths. If field names contains "." (dot), consider it a path
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    for (const key of Object.keys(document.data)) {
      if (key.indexOf('.') > 0) {
        const value = document.data[key];
        delete document.data[key];
        lodash.set(document.data, key, value);
      }
    }
  }
}
