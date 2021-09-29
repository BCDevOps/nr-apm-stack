import {injectable} from 'inversify';
import lodash from 'lodash';
import {OsDocument} from '../types/os-document';
import {Parser} from '../types/parser';

@injectable()
/**
 * Parse backslashes from fields
 */
export class DeslashParser implements Parser {
  /**
   * Returns true if metadata has a deslash field.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].deslash);
  }

  /**
   * Parse backslashes from fields
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    if (!lodash.isNil(lodash.get(document.data, 'log.file.path'))) {
      lodash.set(
        document.data, 'log.file.path', (lodash.get(document.data, 'log.file.path') as string).replace(/\\/g, '/'),
      );
    }
  }
}
