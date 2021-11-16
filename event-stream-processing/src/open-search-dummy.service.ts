import {injectable} from 'inversify';
import {OpenSearchService, OpenSearchBulkResult} from './open-search.service';
import {OsDocument} from './types/os-document';

@injectable()
/**
 * Dummy service that echos back the data sent to it
 */
export class OpenSearchDummyService implements OpenSearchService {
  /**
   * Echo back the documents for localhost testing
   * @param documents The documents that would have been uploaded
   * @returns The result containing info about the documents that would have been uploaded
   */
  bulk(documents: OsDocument[]): Promise<OpenSearchBulkResult> {
    // Refactor OsDocument to return fewer fields in result
    const compactDocs = documents.map((document) => ({
      fingerprint: document.fingerprint.name,
      id: document.id,
      index: document.index,
      data: document.data,
    }));

    return Promise.resolve({
      success: true,
      errors: [],
      result: compactDocs,
    });
  }
}
