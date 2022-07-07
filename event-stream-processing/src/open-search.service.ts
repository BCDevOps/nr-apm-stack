import {OsDocumentPipeline} from './types/os-document';
export interface ResultItem {
  _id: string,
  error?: any
}
export interface ResultOperation {
  create: ResultItem
}

/**
 * Service to post bulk data to OpenSearch
 */
export interface OpenSearchService {
  /**
   * Upload a bulk set of documents from the pipeline
   * @param pipeline The pipeline with documents to upload
   */
  bulk(pipeline: OsDocumentPipeline): Promise<OsDocumentPipeline>;
}
