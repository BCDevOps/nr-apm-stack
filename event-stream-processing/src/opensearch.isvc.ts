export interface ResultItem {
    _id: string,
    error?: any
}
export interface ResultOperation {
    create: ResultItem
}

export interface OpenSearchBulkResult {
    success: boolean,
    errors: any[]
    //items: ResultOperation[]
}

export interface OpenSearch {
    bulk(documents: any[]): Promise<OpenSearchBulkResult>;
}
