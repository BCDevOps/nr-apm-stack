import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import moment from 'moment';
import {OsDocument} from '../types/os-document';
@injectable()
/**
 * Apply index to document
 *
 * Tag: Meta
 */
export class DocumentIndexParser implements Parser {
  /**
   * Returns true if metadata has a index field.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].index);
  }
  /**
   * Apply index to document
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    let indexName: string = lodash.get(document.data, '@metadata.index');
    if (!indexName) {
      throw new Error('Could not map event to an index');
    }
    indexName = this.applyTimestampSubsitution(document, indexName);
    indexName = this.applyDataFieldSubsitution(document, indexName);
    document.index = indexName;
  }
  private applyTimestampSubsitution(document: OsDocument, index: string): string {
    const timestamp = lodash.get(document.data, '@timestamp');
    if (lodash.isNil(timestamp)) {
      throw new Error('@timestamp field value has not been defined');
    }
    const tsMomement = moment(timestamp);
    return index.replace(/\<\%\=[^\=]+=\%\>/gm, (match: string) => {
      if (match.startsWith('<%=')) {
        return tsMomement.format(match.substring(3, match.length - 3));
      }
      throw new Error(`Unexpected formatting: ${match}`);
    });
  }
  private applyDataFieldSubsitution(document: OsDocument, index: string): string {
    const indexDataFieldSubstitute: string = lodash.get(document.data, '@metadata.indexDataFieldSubstitute');
    if (indexDataFieldSubstitute) {
      const documentDataField: string = lodash.get(document.data, indexDataFieldSubstitute);
      if (lodash.isNil(documentDataField)) {
        throw new Error(`${indexDataFieldSubstitute} field value not in document`);
      }
      return index.replace(/\<!\=[^\=]+=!\>/gm, documentDataField);
    }
    return index;
  }
}