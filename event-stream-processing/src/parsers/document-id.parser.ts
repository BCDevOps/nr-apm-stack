import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import {OsDocument} from '../types/os-document';

@injectable()
/**
 * Apply id to document
 */
export class DocumentIdParser implements Parser {
  /**
   * Returns true if metadata has a docid field.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].docid);
  }

  /**
   * Apply id to document
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const docIdPattern: string = lodash.get(document.data, '@metadata.docid');

    // assign document id
    const id = docIdPattern.split(',')
      .map((path) => lodash.get(document.data, path, ''))
      .join(':');

    document.id = id;
  }
}
