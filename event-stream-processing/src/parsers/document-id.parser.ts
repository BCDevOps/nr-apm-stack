import {inject, injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import {OsDocument} from '../types/os-document';
import {TYPES} from '../inversify.types';
import {FieldExtractorService} from '../shared/field-extractor.service';

@injectable()
/**
 * Apply id to document
 *
 * Tag: Meta
 */
export class DocumentIdParser implements Parser {
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.FieldExtractorService) private fieldExtractorService: FieldExtractorService,
  ) {}

  /**
   * Returns true if metadata has a docid field.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].docId);
  }

  /**
   * Apply id to document
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const docIdPattern: string = lodash.get(document.data, '@metadata.docId');

    // assign document id
    const id = this.fieldExtractorService.fieldStringToArray(docIdPattern, document)
      .join(':');

    document.id = id;
  }
}
