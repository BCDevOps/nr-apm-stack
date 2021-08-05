import {NodeCssParser} from './node-css-parser';
import {create as buildContainer, TYPES} from './inversify.config';
import {Randomizer} from './randomizer.isvc';
import {Logger} from './logger.isvc';
import {LoggerVoidImpl} from './logger-void.svc';
import {CityResponse, AsnResponse} from 'maxmind';
import {MaxmindCityLookup, MaxmindAsnLookup} from './maxmindLookup.isvc';
import {KinesisStreamHandler} from './kinesisStreamHandler.isvc';
import {KinesisStreamEvent, KinesisStreamRecord} from 'aws-lambda';
import lodash = require('lodash');
import {APACHE_ACCESS_LOG_EVENT_SIGNATURE} from './parser.apache.svc';

const myContainer = buildContainer();

const geoIpCityLookupVictoria:CityResponse = {
  continent: {code: 'NA', geoname_id: 0, names: {en: 'North America'}},
  country: {iso_code: 'CA', geoname_id: 0, names: {en: 'Canada'}},
  subdivisions: [{geoname_id: 0, iso_code: 'BC', names: {en: 'British Columbia'}}],
  city: {geoname_id: 1, names: {en: 'Victoria'}},
  location: {latitude: 0, longitude: 0, accuracy_radius: 0, time_zone: 'America/Vancouver'},
  postal: {code: 'ABC-123'},
};

const geoIpAsnLookupBcGov:AsnResponse = {
  autonomous_system_number: 123456,
  autonomous_system_organization: 'TEST',
};

beforeEach(() => {
  myContainer.snapshot();
  myContainer.rebind<Randomizer>(TYPES.Randomizer).toConstantValue({randomBytes: ()=>{
    return Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
  }});
  // myContainer.rebind<Logger>(TYPES.Logger).to(LoggerVoidImpl);
  myContainer.rebind<MaxmindCityLookup>(TYPES.MaxmindCityLookup).toConstantValue({
    lookup: ():CityResponse => {
      return geoIpCityLookupVictoria;
    },
  });
  myContainer.rebind<MaxmindAsnLookup>(TYPES.MaxmindAsnLookup).toConstantValue({
    lookup: ():AsnResponse => {
      return geoIpAsnLookupBcGov;
    },
  });
});

afterEach(() => {
  myContainer.restore();
});

// --- the test record object for parsing
const record1 = {
  'agent': {
    'type': 'fluentbit',
  },
  'azp': 'chefs-frontend',
  'clientIp': '2001:db8:3333:4444:5555:6666:7777:8888',
  'contentLength': '323',
  'event': {
    'type': 'http',
    'category': 'web',
    'module': 'node.css',
    'kind': 'event',
    'dataset': 'node.css.http',
  },
  'hostname': 'chefs-app-123',
  'httpVersion': '1.1',
  'hostIp': '10.97.8.1',
  'labels': {
    'env': 'development',
  },
  'level': 'http',
  // eslint-disable-next-line max-len
  'log': '{"responseTime":624,"azp":"chefs-frontend","clientIp":"2001:db8:3333:4444:5555:6666:7777:8888","contentLength":"323","httpVersion":"1.1","hostIp":"::ffff: 10.97.8.1","method":"GET","path":"/api/v1/forms","query":{"active":"true","deleted":"false"},"statusCode":200,"userAgent":"Mozilla/5.0","level":"http","message":"GET /api/v1/forms?active=true 200 624ms","timestamp":"2021-07-14T23: 17: 05.036Z"}',
  'logFilePath': '/var/log/app.log',
  'logFileOffset': 759,
  'logStreamDate': '2021-07-15T20:08:48.845207Z',
  'message': 'GET /api/v1/forms 200 624ms',
  'method': 'GET',
  'namespace': '123-dev',
  'path': '/api/v1/forms',
  'product': 'chefs',
  'query': {
    'active': 'true',
    'deleted': 'false',
  },
  'responseTime': 624,
  'statusCode': 200,
  'timestamp': '2021-07-14T23:17:05.036Z',
  'userAgent': 'Mozilla/5.0',
};

test('basic - GET request', () => {
  const record = JSON.parse(JSON.stringify(record1));
  const filter = new NodeCssParser();

  // expect the parser's match() method to return true and run for this test record
  expect(filter.matches(record)).toEqual(true);

  // --- run the parser:
  filter.apply(record);

  // --- test the result:
  // azp
  expect(record).not.toHaveProperty('azp');
  expect(record).toHaveProperty('client.user.id', 'chefs-frontend');
  // clientIp
  expect(record).not.toHaveProperty('clientIp');
  expect(record).toHaveProperty('client.ip', '2001:db8:3333:4444:5555:6666:7777:8888');
  // contentLength
  expect(record).not.toHaveProperty('contentLength');
  expect(record).toHaveProperty('http.response.body.bytes', '323');
  // hostname
  expect(record).not.toHaveProperty('hostname');
  expect(record).toHaveProperty('kubernetes.pod_name', 'chefs-app-123');
  // httpVersion
  expect(record).not.toHaveProperty('httpVersion');
  expect(record).toHaveProperty('http.version', '1.1');
  // hostIp
  expect(record).not.toHaveProperty('hostIp');
  expect(record).toHaveProperty('kubernetes.pod_ip', '10.97.8.1');
  // labels
  expect(record).toHaveProperty('labels.env', 'development');
  // level
  expect(record).toHaveProperty('log.level', 'http');
  // log
  expect(record).toHaveProperty('event.original');
  // logFileOffset
  expect(record).not.toHaveProperty('logFileOffset');
  expect(record).toHaveProperty('log.file.offset', 759);
  // logFilePath
  expect(record).not.toHaveProperty('logFilePath');
  expect(record).toHaveProperty('log.file.path', '/var/log/app.log');
  // logStreamDate
  expect(record).not.toHaveProperty('logStreamDate');
  expect(record).toHaveProperty('event.created', '2021-07-15T20:08:48.845207Z');
  // method
  expect(record).not.toHaveProperty('method');
  expect(record).toHaveProperty('http.request.method', 'GET');
  // namespace
  expect(record).not.toHaveProperty('namespace');
  expect(record).toHaveProperty('kubernetes.namespace_name', '123-dev');
  // path
  expect(record).not.toHaveProperty('path');
  expect(record).toHaveProperty('url.path', '/api/v1/forms');
  // product
  expect(record).not.toHaveProperty('product');
  expect(record).toHaveProperty('labels.application', 'chefs');
  // query
  expect(record).not.toHaveProperty('query');
  expect(record).toHaveProperty('url.query', 'active=true&deleted=false');
  // responseTime
  expect(record).not.toHaveProperty('responseTime');
  expect(record).toHaveProperty('http.response.time', 624);
  // statusCode
  expect(record).not.toHaveProperty('statusCode');
  expect(record).toHaveProperty('http.response.status_code', 200);
  // timestamp
  expect(record).not.toHaveProperty('timestamp');
  expect(record).toHaveProperty('@timestamp', '2021-07-14T23:17:05.036Z');
  // userAgent
  expect(record).not.toHaveProperty('userAgent');
  expect(record).toHaveProperty('user_agent.original', 'Mozilla/5.0');

  // use snapshot for test
  expect(record).toMatchSnapshot('fea87208-b0d6-49f4-be90-4742487c223a');
});

test('integration test of the full chain', async () => {
  const record = JSON.parse(JSON.stringify(record1));
  const event:KinesisStreamEvent = {
    Records: [
      {
        kinesis: {
          data: Buffer.from(JSON.stringify(record), 'utf8').toString('base64'),
        },
      } as KinesisStreamRecord,
    ],
  };
  const handler = myContainer.get<KinesisStreamHandler>(TYPES.KnesisStreamHandler);
  const documents = await handler.transformToElasticCommonSchema(event);
  expect(documents).toMatchSnapshot('777d8f22-b2da-4fc5-9cf7-752e681aa5b7');
});
