import {KinesisStreamEvent, KinesisStreamRecord} from 'aws-lambda';
import {create as buildContainer, TYPES} from './inversify.config';
import {KinesisStreamHandler} from './kinesisStreamHandler.isvc';
import {APACHE_ACCESS_LOG_EVENT_SIGNATURE} from './parser.apache.svc';
import {Randomizer} from './randomizer.isvc';
import * as lodash from 'lodash';
import {ParserEcs} from './parser.ecs.svc';
import {ParserApplicationClasification} from './parser.apps.svc';
import {Logger} from './logger.isvc';
import {LoggerVoidImpl} from './logger-void.svc';

const myContainer = buildContainer();

beforeEach(() => {
  myContainer.snapshot();
  myContainer.rebind<Randomizer>(TYPES.Randomizer).toConstantValue({randomBytes: ()=>{
    return Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
  }});
  myContainer.rebind<Logger>(TYPES.Logger).to(LoggerVoidImpl);
});

afterEach(() => {
  myContainer.restore();
});

test('apache - safe uri', async () => {
  // eslint-disable-next-line max-len
  const message1 = 'v1.0 20120211 "https://testapps.nrs.gov.bc.ca:443" "2001:569:be94:4700:61b4:917e:808:e3c6" [20/Apr/2021:15:10:40 -0700] "POST /int/fncs/activities/details.xhtml HTTP/1.1" 200 2600 bytes 1112 bytes "https://testapps.nrs.gov.bc.ca/int/fncs/activities/details.xhtml?activityGuid=0123C676CBAB461E8C6A0A14567A16AC" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36" 133 ms, "TLSv1.2" "ECDHE-RSA-AES256-GCM-SHA384"';

  const event:KinesisStreamEvent = {
    Records: [
      {
        kinesis: {
          data: Buffer.from(
            JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: message1}), 'utf8',
          ).toString('base64'),
        },
      } as any as KinesisStreamRecord,
    ],
  };
  const handler = myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler);
  const events = await handler.transformToElasticCommonSchema(event);
  expect(events).toHaveLength(1);
  for (const event of events) {
    expect(event).toHaveProperty('url.original');
    expect(event).toHaveProperty('url.path');
    expect(event).toHaveProperty('http.request.line');
    expect(event).toHaveProperty('http.request.method');
    expect(event).toHaveProperty('http.version');
    expect(event).toHaveProperty('event.ingested');
    delete event.event.ingested;
  }
  expect(events).toMatchSnapshot('8cb108e0-c707-4faf-83fc-10bc756f6b1b');
});

test('apache - safe-ish uri', async () => {
  // eslint-disable-next-line max-len
  const message1 = 'v1.0 20120211 "https://testapps.nrs.gov.bc.ca:443" "2001:569:be94:4700:61b4:917e:808:e3c6" [20/Apr/2021:15:10:40 -0700] "POST /int/fncs/activities/ details.xhtml HTTP/1.1" 200 2600 bytes 1112 bytes "https://testapps.nrs.gov.bc.ca/int/fncs/activities/details.xhtml?activityGuid=0123C676CBAB461E8C6A0A14567A16AC" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36" 133 ms, "TLSv1.2" "ECDHE-RSA-AES256-GCM-SHA384"';
  // eslint-disable-next-line max-len
  const message2 = 'v1.0 20120211 "https://testapps.nrs.gov.bc.ca:443" "2001:569:be94:4700:61b4:917e:808:e3c6" [20/Apr/2021:15:10:40 -0700] "POST /int/fncs/activities/%20details.xhtml HTTP/1.1" 200 2600 bytes 1112 bytes "https://testapps.nrs.gov.bc.ca/int/fncs/activities/details.xhtml?activityGuid=0123C676CBAB461E8C6A0A14567A16AC" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36" 133 ms, "TLSv1.2" "ECDHE-RSA-AES256-GCM-SHA384"';

  const event:KinesisStreamEvent = {
    Records: [
      {
        kinesis: {
          data: Buffer.from(
            JSON.stringify({
              ...APACHE_ACCESS_LOG_EVENT_SIGNATURE,
              message: message1,
            }), 'utf8').toString('base64'),
        },
      } as any as KinesisStreamRecord,
      {
        kinesis: {
          data: Buffer.from(
            JSON.stringify({
              ...APACHE_ACCESS_LOG_EVENT_SIGNATURE,
              message: message2,
            }), 'utf8').toString('base64'),
        },
      } as any as KinesisStreamRecord,
    ],
  };
  const handler = myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler);
  const events = await handler.transformToElasticCommonSchema(event);
  expect(events).toHaveLength(2);
  // expect(events).toMatchSnapshot('4a7f73e8-2b1b-43c9-babd-0a8deb1d09a2')
  for (const event of events) {
    expect(event).toHaveProperty('url.original');
    expect(event).toHaveProperty('url.path');
  }
});

test('apache - unsafe uri', async () => {
  // eslint-disable-next-line max-len
  const message1 = 'v1.0 20120211 "https://testapps.nrs.gov.bc.ca:443" "2001:569:be94:4700:61b4:917e:808:e3c6" [20/Apr/2021:15:10:40 -0700] "POST ../int/fncs/activities/details.xhtml HTTP/1.1" 200 2600 bytes 1112 bytes "https://testapps.nrs.gov.bc.ca/int/fncs/activities/details.xhtml?activityGuid=0123C676CBAB461E8C6A0A14567A16AC" "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.128 Safari/537.36" 133 ms, "TLSv1.2" "ECDHE-RSA-AES256-GCM-SHA384"';

  const event:KinesisStreamEvent = {
    Records: [
      {
        kinesis: {
          data: Buffer.from(
            JSON.stringify({
              ...APACHE_ACCESS_LOG_EVENT_SIGNATURE,
              message: message1,
            }), 'utf8').toString('base64'),
        },
      } as any as KinesisStreamRecord,
    ],
  };
  const handler = myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler);
  const events = await handler.transformToElasticCommonSchema(event);
  expect(events).toHaveLength(1);
  for (const event of events) {
    expect(event).toHaveProperty('url.original');
    expect(event).not.toHaveProperty('url.path');
  }
  // expect(events).toMatchSnapshot('59d34900-3da1-4541-a3fc-2fcd43e2056c')
});


test('geoip - client.ip', async () => {
  const event:KinesisStreamEvent = {
    Records: [
      {
        kinesis: {
          data: Buffer.from(
            JSON.stringify({
              ...APACHE_ACCESS_LOG_EVENT_SIGNATURE,
              client: {ip: '2001:569:be94:4700:61b4:917e:808:e3c6'},
            }), 'utf8').toString('base64'),
        },
      } as any as KinesisStreamRecord,
    ],
  };
  const handler = myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler);
  const events = await handler.transformToElasticCommonSchema(event);
  expect(events).toHaveLength(1);
  for (const event of events) {
    expect(event).toHaveProperty('client.geo.country_name');
    expect(event).toHaveProperty('client.geo.city_name');
    expect(event).toHaveProperty('client.geo.location');
    expect(event).toHaveProperty('event.ingested');
    delete event.event.ingested;
  }
  expect(events).toMatchSnapshot('eb9545ae-e9a8-41bb-8998-81fb0a1931b9');
});

test('geoip - source.address', async () => {
  const event:KinesisStreamEvent = {
    Records: [
      {
        kinesis: {
          data: Buffer.from(
            JSON.stringify({
              ...APACHE_ACCESS_LOG_EVENT_SIGNATURE,
              source: {address: '2001:569:be94:4700:61b4:917e:808:e3c6'},
            }), 'utf8').toString('base64'),
        },
      } as any as KinesisStreamRecord,
    ],
  };
  const handler = myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler);
  const events = await handler.transformToElasticCommonSchema(event);
  expect(events).toHaveLength(1);
  for (const event of events) {
    expect(event).toHaveProperty('source.geo.country_name');
    expect(event).toHaveProperty('source.geo.city_name');
    expect(event).toHaveProperty('source.geo.location');
  }
  // expect([]).toMatchSnapshot('59d34900-3da1-4541-a3fc-2fcd43e2056c')
});

test('apache - empty', async () => {
  const event:KinesisStreamEvent = {
    Records: [
            {
              kinesis: {
                data: Buffer.from(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE}), 'utf8').toString('base64'),
              },
            } as any as KinesisStreamRecord,
    ],
  };
  const handler = myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler);
  const events = await handler.transformToElasticCommonSchema(event);
  for (const event of events) {
    expect(event).toHaveProperty('event.ingested');
    delete event.event.ingested;
  }
  expect(events).toHaveLength(1);
  expect(events).toMatchSnapshot('eb6509a2-5862-41fc-86a0-8f8e692a9131');
});

test('app labels', async () => {
  const event:KinesisStreamEvent = {
    Records: [
      {
        kinesis: {
          data: Buffer.from(
            JSON.stringify(
              lodash.merge({},
                APACHE_ACCESS_LOG_EVENT_SIGNATURE,
                {url: {domain: 'a100.gov.bc.ca', path: '/int/irs/hello'}}),
            ), 'utf8').toString('base64'),
        },
      } as any as KinesisStreamRecord,
    ],
  };
  const handler = myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler);
  const events = await handler.transformToElasticCommonSchema(event);
  expect(events).toHaveLength(1);
  // await expect(events).toMatchSnapshot('fe9ed426-57e5-4148-ab8e-0dce6b2c517e')
  for (const event of events) {
    expect(event).toHaveProperty('labels.application');
    expect(event).toHaveProperty('labels.context');
    expect(event.labels.application).toEqual('irs');
  }
});

test('http event.outcome', () => {
  const parser = new ParserApplicationClasification();
  const record:any = lodash.merge(
    {},
    APACHE_ACCESS_LOG_EVENT_SIGNATURE,
    {url: {scheme: 'http', domain: 'sitesandtrailsbc.ca', path: '/welcome'}},
  );
  parser.apply(record);
  expect(record).toHaveProperty('event.ingested');
  delete record.ingested;
  expect(record).toMatchSnapshot('fe9ed426-57e5-4148-ab8e-0dce6b2c517e');
  expect(record).toHaveProperty('labels.application');
  // expect(record).toHaveProperty('labels.context')
  expect(record.labels.application).toEqual('sitesandtrailsbc');
  expect(record.labels).not.toHaveProperty('context');
});

test('app labels - sitesandtrailsbc.ca', () => {
  const parser = new ParserApplicationClasification();
  const record:any = lodash.merge(
    {},
    APACHE_ACCESS_LOG_EVENT_SIGNATURE,
    {url: {domain: 'sitesandtrailsbc.ca', path: '/welcome'}},
  );
  parser.apply(record);
  delete record.event.ingested;
  expect(record).toMatchSnapshot('fe9ed426-57e5-4148-ab8e-0dce6b2c517e');
  expect(record).toHaveProperty('labels.application');
  // expect(record).toHaveProperty('labels.context')
  expect(record.labels.application).toEqual('sitesandtrailsbc');
  expect(record.labels).not.toHaveProperty('context');
});

test('ecs - referrer - simple', () => {
  const parser = new ParserEcs();
  const record = {http: {request: {referrer: {original: 'http://somewhere.com/with/some/path.ext'}}}};
  parser.apply(record);
  expect(record).toHaveProperty('http.request.referrer.original');
  expect(record).toHaveProperty('http.request.referrer.scheme');
  expect(record).toHaveProperty('http.request.referrer.domain');
  expect(record).toHaveProperty('http.request.referrer.port');
  expect(record).toHaveProperty('http.request.referrer.path');
  expect(record).not.toHaveProperty('http.request.referrer.username');
  expect(record).not.toHaveProperty('http.request.referrer.query');
  expect(record).not.toHaveProperty('http.request.referrer.fragment');
  // expect(record).toMatchSnapshot('9cf7ae9d-2410-464e-9ec6-65d3241dbe8a')
});

test('ecs - referrer - no path', () => {
  const parser = new ParserEcs();
  const record: any = {http: {request: {referrer: {original: 'http://somewhere.com'}}}};
  const matches = parser.matches();
  parser.apply(record);
  expect(matches).toEqual(true);
  expect(record).toHaveProperty('http.request.referrer.original');
  expect(record).toHaveProperty('http.request.referrer.scheme');
  expect(record).toHaveProperty('http.request.referrer.domain');
  expect(record).toHaveProperty('http.request.referrer.port');
  expect(record).toHaveProperty('http.request.referrer.path');
  expect(record.http.request.referrer.path).toMatch(/^\//);
  expect(record).not.toHaveProperty('http.request.referrer.username');
  expect(record).not.toHaveProperty('http.request.referrer.query');
  expect(record).not.toHaveProperty('http.request.referrer.fragment');
  expect(record).toMatchSnapshot('fe3a90a4-1319-44e0-af0f-312686d81ae7');
});

test('ecs - referrer - path with just /', () => {
  const parser = new ParserEcs();
  const record:any = {http: {request: {referrer: {original: 'http://somewhere.com/'}}}};
  parser.apply(record);
  expect(record).toHaveProperty('http.request.referrer.original');
  expect(record).toHaveProperty('http.request.referrer.scheme');
  expect(record).toHaveProperty('http.request.referrer.domain');
  expect(record).toHaveProperty('http.request.referrer.port');
  expect(record.http.request.referrer.port).toEqual('80');
  expect(record).toHaveProperty('http.request.referrer.path');
  expect(record.http.request.referrer.path).toMatch(/^\//);
  expect(record).not.toHaveProperty('http.request.referrer.username');
  expect(record).not.toHaveProperty('http.request.referrer.query');
  expect(record).not.toHaveProperty('http.request.referrer.fragment');
  expect(record).toMatchSnapshot('84023bc4-77fe-439f-9123-91c20362c04a');
});
