import {OsDocument, PipelineObject, PipelineTuple} from './types/os-document';
export interface ResultItem {
  _id: string,
  error?: any
}
export interface ResultOperation {
  create: ResultItem
}

export interface OpenSearchBulkResult {
  success: boolean,
  errors: any[],
  result?: any,
}

/**
 * Service to post bulk data to OpenSearch
 */
export interface OpenSearchService {
  /**
   * Upload a bulk set of documents
   * @param tuple The documents to upload
   */
  bulk(tuple: PipelineTuple): Promise<PipelineTuple>;
}
