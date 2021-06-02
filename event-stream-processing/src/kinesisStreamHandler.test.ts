import { KinesisStreamEvent, Context, KinesisStreamRecord } from "aws-lambda";
import { create as buildContainer, TYPES } from "./inversify.config";
import { KinesisStreamHandler } from "./kinesisStreamHandler.isvc";
import { OpenSearch, OpenSearchBulkResult } from "./opensearch.isvc";
import * as lodash from 'lodash'
import { AwsHttpClient, HttpBufferedResponse, HttpRequestOptions, HttpResponseWrapper } from "./aws-http-client.isvc";
import { APACHE_ACCESS_LOG_EVENT_SIGNATURE } from "./parser.apache.svc";
import { Randomizer } from "./randomizer.isvc";
import { Logger } from "./logger.isvc";

const myContainer = buildContainer()

const message1 = 'v1.0 20120211 "https://testapps.nrs.gov.bc.ca:443" "2001:569:be94:4700:61b4:917e:808:e3c6" [20/Apr/2021:15:10:40 -0700] "POST /int/fncs/activities/details.xhtml HTTP/1.1" 200 2600 bytes 1112 bytes "https://testapps.nrs.gov.bc.ca/int/fncs/activities/details.xhtml?activityGuid=0123C676CBAB461E8C6A0A14567A16AC" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36" 133 ms, "TLSv1.2" "ECDHE-RSA-AES256-GCM-SHA384"'
const message1_1 = 'v1.0 20120211 "https://testapps.nrs.gov.bc.ca:443" "2001:569:be94:4700:61b4:917e:808:e3c6" [36/Amz/2021:15:10:40 -0700] "POST /int/fncs/activities/details.xhtml HTTP/1.1" 200 2600 bytes 1112 bytes "https://testapps.nrs.gov.bc.ca/int/fncs/activities/details.xhtml?activityGuid=0123C676CBAB461E8C6A0A14567A16AC" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36" 133 ms, "TLSv1.2" "ECDHE-RSA-AES256-GCM-SHA384"'
const apacheAccesLogEvent = APACHE_ACCESS_LOG_EVENT_SIGNATURE
const event1 = Object.assign({message: message1}, apacheAccesLogEvent)
const record1 = {
    kinesis:{
        sequenceNumber: '123',
        data: Buffer.from(JSON.stringify(event1), 'utf8').toString('base64')
    }
} as any as KinesisStreamRecord
const record2 = {
    kinesis:{
        sequenceNumber: '456',
        data: Buffer.from(JSON.stringify(event1), 'utf8').toString('base64')
    }
} as any as KinesisStreamRecord
const record3 = {
    kinesis:{
        sequenceNumber: '456',
        data: Buffer.from(JSON.stringify(Object.assign({message: message1_1}, apacheAccesLogEvent)), 'utf8').toString('base64')
    }
} as any as KinesisStreamRecord

function mockContext(): Context {
    return {} as any as Context
}

beforeEach(() => {
    myContainer.snapshot();
    myContainer.rebind<Randomizer>(TYPES.Randomizer).toConstantValue({randomBytes:(size: number)=>{ return Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])}})
    myContainer.rebind<Logger>(TYPES.Logger).toConstantValue({log:()=>{}})
})

afterEach(() => {
    myContainer.restore();
})

test('handler - success', async () => {
    const ctx:Context = mockContext()
    const event:KinesisStreamEvent = {Records:[record1]}
    //myContainer.unbind(TYPES.OpenSearch)
    let openSearchMock = {
        bulk: (documents: any): Promise<OpenSearchBulkResult> =>{
            return Promise.resolve({errors: false, items: []})
        }
    }
    //myContainer.rebind()
    myContainer.rebind<OpenSearch>(TYPES.OpenSearch).toConstantValue(openSearchMock);
    await expect(event).toMatchSnapshot('895ca8a6-0788-41ba-b921-9edbbd3212dc')
    await expect(myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler).handle(event, ctx)).resolves.not.toThrow();
});

test('handler - all errors', async () => {
    const ctx:Context = mockContext()
    const event:KinesisStreamEvent = {Records:[record1, record2]}
    //myContainer.unbind(TYPES.OpenSearch)
    let openSearchMock = {
        bulk: (documents: any[]): Promise<OpenSearchBulkResult> =>{
            //return Promise.resolve({errors:false, items:[]})
            return Promise.resolve({errors: true, items: documents.map(item => {return {create:{"_id":item._id, "error":{}}}})})
        }
    }
    //myContainer.rebind()
    myContainer.rebind<OpenSearch>(TYPES.OpenSearch).toConstantValue(openSearchMock);
    await expect(event).toMatchSnapshot('d52cf91b-50a5-4f26-9d3e-c312778360e0')
    const result = await myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler).handle(event, ctx)
    await expect(result).toMatchSnapshot('e1e643c5-5a81-4695-a367-82a1f093ed49')
});

test('handler - partial error', async () => {
    const ctx:Context = mockContext()
    // note: records need to be cloned so they don't interfer with each other and other tests
    const event:KinesisStreamEvent = {Records:[
        lodash.set(JSON.parse(JSON.stringify(record1)), 'kinesis.sequenceNumber', '1'),
        lodash.set(JSON.parse(JSON.stringify(record3)), 'kinesis.sequenceNumber', '2'),
        lodash.set(JSON.parse(JSON.stringify(record2)), 'kinesis.sequenceNumber', '3'),
        lodash.set(JSON.parse(JSON.stringify(record1)), 'kinesis.sequenceNumber', '4'),
        lodash.set(JSON.parse(JSON.stringify(record1)), 'kinesis.sequenceNumber', '5'),
    ]}
    let awsHttpClientMock = {
        executeSignedHttpRequest: (httpRequestParams: HttpRequestOptions): Promise<HttpResponseWrapper> => {
            const items = httpRequestParams.body.trim().split('\n');
            const response = {body:{errors: false, items:[] as any[]}}
            for (let index = 0; index < items.length; index+=2) {
                const item = JSON.parse(items[index])
                const item2:any = {create:{_id:item.create._id}}
                if (response.body.items.length % 2 === 0){
                    response.body.errors = true
                    item2.create.error = {}
                }
                response.body.items.push(item2);
            }
            return Promise.resolve({response} as HttpResponseWrapper)
        },
        waitAndReturnResponseBody: (value: HttpResponseWrapper): Promise<HttpBufferedResponse> => {
            return Promise.resolve({ statusCode: 200, body: JSON.stringify(value.response.body)} as HttpBufferedResponse);
        }
    } as AwsHttpClient
    //myContainer.rebind()
    myContainer.rebind<AwsHttpClient>(TYPES.AwsHttpClient).toConstantValue(awsHttpClientMock);
    // await expect(event).toMatchSnapshot('d52cf91b-50a5-4f26-9d3e-c312778360e0')
    const result = await myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler).handle(event, ctx)
    await expect(result).toMatchSnapshot('e1e643c5-5a81-4695-a367-82a1f093ed49')
});

for (let index = 1; index <= 2; index++) {
    test(`transformToElasticCommonSchema1.${index}`, async () => {
        const event:KinesisStreamEvent = {
            Records: [
                record1,
            ]
        }
        const events = await myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler).transformToElasticCommonSchema(event)
        await expect(events).toHaveLength(1);
        await expect(events[0]).toHaveProperty('_index')
        await expect(events[0]).toHaveProperty('source.ip')
        await expect(events[0]).toHaveProperty('source.geo')
    });    
}