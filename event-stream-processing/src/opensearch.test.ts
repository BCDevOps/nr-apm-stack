import { Container } from "inversify";
import { AwsHttpClient, HttpBufferedResponse, HttpRequestOptions, HttpResponseWrapper } from "./aws-http-client.isvc";
import { TYPES } from "./inversify.types";
import { OpenSearch } from "./opensearch.isvc";
import { OpenSearchImpl } from "./opensearch.svc";

test('index', async () => {
    let awsHttpClientMock:AwsHttpClient  = {
        executeSignedHttpRequest: (httpRequestParams: HttpRequestOptions): Promise<HttpResponseWrapper> => {
            const items = httpRequestParams.body.trim().split('\n');
            const response = {body:{errors: false, items:[] as any[]}}
            for (let index = 0; index < items.length; index+=2) {
                const item = JSON.parse(items[index])
                const item2:any = {create:{_id:item.create._id}}
                response.body.items.push(item2);
            }
            return Promise.resolve({response} as HttpResponseWrapper)
        },
        waitAndReturnResponseBody: (value: HttpResponseWrapper): Promise<HttpBufferedResponse> => {
            return Promise.resolve({ statusCode: 200, body: JSON.stringify(value.response.body)} as HttpBufferedResponse);
        }
    }

    const myContainer = new Container();
    myContainer.bind<OpenSearch>(TYPES.OpenSearch).to(OpenSearchImpl);
    myContainer.bind<AwsHttpClient>(TYPES.AwsHttpClient).toConstantValue(awsHttpClientMock);
    const openSearchClient = myContainer.get<OpenSearch>(TYPES.OpenSearch);
    const output = await openSearchClient.bulk([
        {'@timestamp': new Date(), message:'Hello', _index:'my-index1', _id: '1'},
        {'@timestamp': new Date(), message:'Hello', _index:'my-index2', _id: '2'}
    ])
    expect(output).toEqual({"errors": false, items:[{"create":{_id: "1"}}, {"create":{_id: "2"}}]})
});
