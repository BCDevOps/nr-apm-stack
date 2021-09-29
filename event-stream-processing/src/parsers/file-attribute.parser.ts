import {injectable} from 'inversify';
import lodash from 'lodash';
import {expandFileAttributesFromPath} from '../shared/expand-file-attributes-from-path';
import {OsDocument} from '../types/os-document';
import {Parser} from '../types/parser';

@injectable()
/**
 * Parse attributes from fields
 */
export class FileAttributeParser implements Parser {
  /**
   * Returns true if metadata has a fileAttributes field.
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].fileAttributes);
  }

  /**
   * Parse attributes from fields
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    if (!lodash.isNil(lodash.get(document.data, 'log.file.path'))) {
      expandFileAttributesFromPath(
        lodash.get(document.data, 'log.file.path') as string, lodash.get(document.data, 'log.file'),
      );
    }
  }
}
