import {OsDocument} from './types/os-document';
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
export interface OpenSearchService {
  bulk(documents: OsDocument[]): Promise<OpenSearchBulkResult>;
}
