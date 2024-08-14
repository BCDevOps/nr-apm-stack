import lodash from 'lodash';
import { injectable } from 'inversify';
import { Parser } from '../types/parser';
import { OsDocument } from '../types/os-document';

@injectable()
/**
 * Remove metadata field from data.
 * Tag: Meta
 */
export class RemoveMetadataParser implements Parser {
  /**
   * Returns true if the document has a metadata field.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !lodash.isNil(document.data['@metadata']);
  }

  /**
   * Remove metadata field from data.
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    delete document.data['@metadata'];
  }
}
