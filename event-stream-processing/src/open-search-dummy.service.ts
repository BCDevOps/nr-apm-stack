import {inject, injectable} from 'inversify';
import {TYPES} from './inversify.types';
import {OpenSearchService, OpenSearchBulkResult} from './open-search.service';
import {OsDocument} from './types/os-document';
import {LoggerService} from './util/logger.service';

@injectable()
export class OpenSearchDummyService implements OpenSearchService {
  constructor(
    @inject(TYPES.LoggerService) private logger: LoggerService,
  ) {}

  /**
   * Echo back the documents for localhost testing
   * @param documents The documents that would have been uploaded
   * @returns The result containing info about the documents that would have been uploaded
   */
  bulk(documents: OsDocument[]): Promise<OpenSearchBulkResult> {
    // Remove extraneous fields
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
