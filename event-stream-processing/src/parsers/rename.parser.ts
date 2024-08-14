import { injectable } from 'inversify';
import { renameField } from '../shared/rename-field';
import { OsDocument } from '../types/os-document';
import { Parser } from '../types/parser';

@injectable()
/**
 * Parse rename of fields
 * @deprecated
 */
export class RenameParser implements Parser {
  /**
   * Returns true if metadata has a rename field.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].rename);
  }

  /**
   * Parse rename of fields. Multiple renames can be specified separated by a comma.
   * The source and destination are separated by a colon.
   * Example: "source:destination,orginal.location:final.location"
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const renameArr = (document.data['@metadata'].rename as string).split(',');
    for (const renameStr of renameArr) {
      const [src, dest] = renameStr.split(':');
      renameField(document.data, src, dest);
    }
  }
}
