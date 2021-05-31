import { KinesisStreamEvent, KinesisStreamRecord } from "aws-lambda";
import { create as buildContainer, TYPES } from "./inversify.config";
import { KinesisStreamHandler } from "./kinesisStreamHandler.isvc";
import { APACHE_ACCESS_LOG_EVENT_SIGNATURE } from "./parser.apache.svc";
import { Randomizer } from "./randomizer.isvc";
import * as lodash from 'lodash'
import { ParserEcs } from "./parser.ecs.svc";
import { ParserApplicationClasification } from "./parser.apps.svc";

const myContainer = buildContainer()

beforeEach(() => {
    myContainer.snapshot();
    myContainer.rebind<Randomizer>(TYPES.Randomizer).toConstantValue({randomBytes:(size: number)=>{ return Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])}})
})

afterEach(() => {
    myContainer.restore();
})

test('app labels', async () => {
    const event:KinesisStreamEvent = {
        Records: [
            {
                kinesis:{
                    data: Buffer.from(JSON.stringify(lodash.merge({}, APACHE_ACCESS_LOG_EVENT_SIGNATURE,
                        {url:{domain:'a100.gov.bc.ca', path:'/int/irs/hello'}}
                    )), 'utf8').toString('base64')
                }
            } as any as KinesisStreamRecord,
            {
                kinesis:{
                    data: Buffer.from(JSON.stringify(lodash.merge({}, APACHE_ACCESS_LOG_EVENT_SIGNATURE,
                        {url:{domain:'delivery.a100.gov.bc.ca', path:'/pub/oatsp/apply'}}
                    )), 'utf8').toString('base64')
                }
            } as any as KinesisStreamRecord,
            {
                kinesis:{
                    data: Buffer.from(JSON.stringify(lodash.merge({}, APACHE_ACCESS_LOG_EVENT_SIGNATURE,
                        {url:{domain:'delivery.a100.gov.bc.ca', path:'/ext/ilrr/script/cwm/img/spinner-30.gif;'}}
                    )), 'utf8').toString('base64')
                }
            } as any as KinesisStreamRecord,
            {
                kinesis:{
                    data: Buffer.from(JSON.stringify(lodash.merge({}, APACHE_ACCESS_LOG_EVENT_SIGNATURE,
                        {url:{domain:'delivery.a100.gov.bc.ca', path:'/ext/ips/javax.faces.resource/jsf.js.jsf'}}
                    )), 'utf8').toString('base64')
                }
            } as any as KinesisStreamRecord,
        ]
    }
    const handler = myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler)
    const events = await handler.transformToElasticCommonSchema(event)
    await expect(events).toHaveLength(4);
    //await expect(events).toMatchSnapshot('fe9ed426-57e5-4148-ab8e-0dce6b2c517e')
    for (const event of events) {
        expect(event).toHaveProperty('labels.application')
        expect(event).toHaveProperty('labels.context')
    }
    expect(events[0].labels.application).toEqual('irs')
    expect(events[1].labels.application).toEqual('oatsp')
    expect(events[2].labels.application).toEqual('ilrr')
    expect(events[3].labels.application).toEqual('ips')
});

test('app - sitesandtrailsbc.ca', async () => {
    const parser = new ParserApplicationClasification()
    const events: any[] = [
        {url:{domain:'www.del.sitesandtrailsbc.ca', path:'/resources/REC2164/siteimages/images.properties.txt'}}
    ]
    for (const event of events) {
        parser.apply(event)
    }
    await expect(events).toHaveLength(1);
    //await expect(events).toMatchSnapshot('fe9ed426-57e5-4148-ab8e-0dce6b2c517e')
    for (const event of events) {
        expect(event).toHaveProperty('labels.application')
        expect(event).toHaveProperty('labels.application', 'sitesandtrailsbc')
    }
});

test('app - clp-cgi', async () => {
    const parser = new ParserApplicationClasification()
    const events: any[] = [
        {url:{domain:'142.34.120.12', path:'/clp-cgi/accessDenied.cgi'}}
    ]
    for (const event of events) {
        parser.apply(event)
    }
    await expect(events).toHaveLength(1);
    //await expect(events).toMatchSnapshot('fe9ed426-57e5-4148-ab8e-0dce6b2c517e')
    for (const event of events) {
        expect(event).toHaveProperty('labels.application', 'clp-cgi')
    }
});

