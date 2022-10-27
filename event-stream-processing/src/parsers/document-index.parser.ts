import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import moment from 'moment';
import {OsDocument} from '../types/os-document';
import {ParserError} from '../util/parser.error';
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
    const indexPreprodQualifier: string = lodash.get(document.data, '@metadata.indexPreprodQualifier');
    if (!indexName) {
      throw new ParserError('Could not map event to an index', this.constructor.name);
    }
    indexName = this.applyTimestampSubstitution(document, indexName);
    indexName = this.applyDataFieldSubstitution(document, indexName);
    if (indexPreprodQualifier) {
      indexName = this.applyPreprodQualifier(document, indexName);
    }
    document.index = indexName;
  }
  private applyTimestampSubstitution(document: OsDocument, index: string): string {
    const timestamp = lodash.get(document.data, '@timestamp');
    if (lodash.isNil(timestamp)) {
      throw new ParserError('@timestamp field value has not been defined', this.constructor.name);
    }
    const tsMomement = moment(timestamp);
    return index.replace(/\<\%\=[^\=]+=\%\>/gm, (match: string) => {
      if (match.startsWith('<%=')) {
        return tsMomement.format(match.substring(3, match.length - 3));
      }
      throw new ParserError(`Unexpected formatting: ${match}`, this.constructor.name);
    });
  }
  private applyDataFieldSubstitution(document: OsDocument, index: string): string {
    return index.replace(/\<\!\=[^\=]+=\!\>/gm, (match: string) => {
      if (match.startsWith('<!=')) {
        const fieldName = match.substring(3, match.length - 3);
        const substitution = lodash.get(document.data, fieldName);
        if (lodash.isNil(substitution)) {
          throw new ParserError(`${fieldName} field value not in document`, this.constructor.name);
        }
        return substitution;
      }
      throw new ParserError(`Unexpected formatting: ${match}`, this.constructor.name);
    });
  }

  private applyPreprodQualifier(document: OsDocument, index: string): string {
    if (lodash.get(document.data, 'service.environment') === 'production') {
      return index;
    } else {
      const offset = index.lastIndexOf('-');
      return offset > 0 ? `${index.substring(0, offset)}-preprod${index.substring(offset)}` : index;
    }
  }
}
