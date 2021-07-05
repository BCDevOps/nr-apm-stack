import {HttpResponse} from '@aws-sdk/protocol-http';
import {Endpoint, HttpMessage} from '@aws-sdk/types';

export type HttpRequestOptions = Partial<HttpMessage> & Partial<Endpoint> & {
    method: string;
};

export interface HttpResponseWrapper {
    response: HttpResponse
}

export interface HttpBufferedResponse {
    statusCode: number,
    body: string
}

export interface AwsHttpClient {
    executeSignedHttpRequest(httpRequestParams: HttpRequestOptions): Promise<HttpResponseWrapper>;
    waitAndReturnResponseBody(res: HttpResponseWrapper): Promise<HttpBufferedResponse>
}
