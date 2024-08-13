import { injectable } from 'inversify';
import { Parser } from '../types/parser';
import { OsDocument } from '../types/os-document';
import lodash from 'lodash';

@injectable()
/**
 * Computes the event.outcome for the document
 * Tag: Support
 */
export class HttpStatusEventOutcomeParser implements Parser {
  /**
   * Returns true if the document has a metadata field httpStatusOutcome and
   * http.response.status_code field and no event.outcome field.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return (
      !!(
        document.data['@metadata'] &&
        document.data['@metadata'].httpStatusOutcome === true
      ) &&
      !lodash.isNil(lodash.get(document.data, 'http.response.status_code')) &&
      lodash.isNil(lodash.get(document.data, 'event.outcome'))
    );
  }

  /**
   * Add event.outcome to document
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const statusCode = parseInt(
      lodash.get(document.data, 'http.response.status_code'),
    );
    if (statusCode >= 200 && statusCode < 400) {
      lodash.set(document.data, 'event.outcome', 'success');
    } else if (statusCode == 401 || statusCode == 403) {
      lodash.set(document.data, 'event.outcome', 'success');
    } else if (statusCode >= 400 && statusCode < 600) {
      lodash.set(document.data, 'event.outcome', 'failure');
    } else {
      lodash.set(document.data, 'event.outcome', 'unknown');
    }
  }
}
