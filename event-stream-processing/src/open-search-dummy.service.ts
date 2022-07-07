import {injectable} from 'inversify';
import {OpenSearchService} from './open-search.service';
import {OsDocument, OsDocumentPipeline} from './types/os-document';

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
  async bulk(pipeline: OsDocumentPipeline): Promise<OsDocumentPipeline> {
    // Refactor OsDocument to return fewer fields in result
    const compactDocs = pipeline.documents.map((document) => ({
      fingerprint: document.fingerprint.name,
      id: document.id,
      index: document.index,
      data: document.data,
    }));

    return Promise.resolve({
      documents: compactDocs as unknown as OsDocument[],
      failures: pipeline.failures,
    });
  }
}
