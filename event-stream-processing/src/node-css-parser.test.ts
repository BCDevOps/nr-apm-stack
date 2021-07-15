import { NodeCssParser } from './node-css-parser';

test('basic', () => {
  const filter = new NodeCssParser();

  /* eslint-disable */

  // record from fluent-bit looks like this:
  /*

  [
    1
  ] app.http: [
    1626304625.036902482,
    {
      "statusCode"=>200,
      "userAgent"=>"Mozilla/5.0",
      "path"=>"/api/v1/forms",
      "message"=>"GET /api/v1/forms 200 624ms",
      "logFilePath"=>"/var/log/app.log",
      "logFileOffset"=>759,
      "hostname"=>"chefs-app-123",
      "timestamp"=>"2021-07-14T23:17:05.036Z",
      "product"=>"chefs",
      "namespace"=>"123-dev",
      "azp"=>"chefs-frontend",
      "level"=>"http",
      "contentLength"=>"323",
      "agent"=>{
        "type"=>"fluentbit"
      },
      "responseTime"=>624,
      "httpVersion"=>"1.1",
      "event"=>{
        "type"=>"http",
        "module"=>"node.css",
        "kind"=>"event",
        "dataset"=>"node.css.http"
      },
      "ip"=>"::ffff:10.97.8.1",
      "log"=>"{"responseTime":624,"azp":"chefs-frontend","contentLength":"323","httpVersion":"1.1","ip":": :ffff: 10.97.8.1","method":"GET","path":"/api/v1/forms","statusCode":200,"userAgent":"Mozilla/5.0","level":"http","message":"GET /api/v1/forms 200 624ms","timestamp":"2021-07-14T23: 17: 05.036Z"}",
      "method"=>"GET"
    }
  ]
  */
  /* eslint-enable */


  // --- the test record object for parsing
  const record = {
    'agent': {
      'type': 'fluentbit',
    },
    'azp': 'chefs-frontend',
    'contentLength': '323',
    'event': {
      'type': 'http',
      'module': 'node.css',
      'kind': 'event',
      'dataset': 'node.css.http',
    },
    'hostname': 'chefs-app-123',
    'httpVersion': '1.1',
    'ip': '::ffff:10.97.8.1',
    'level': 'http',
    'log': {
      'responseTime': 624,
      'azp': 'chefs-frontend',
      'contentLength': '323',
      'httpVersion': '1.1',
      'ip': ': :ffff: 10.97.8.1',
      'method': 'GET',
      'path': '/api/v1/forms',
      'statusCode': 200,
      'userAgent': 'Mozilla/5.0',
      'level': 'http',
      'message': 'GET /api/v1/forms 200 624ms', 'timestamp': '2021-07-14T23: 17: 05.036Z',
    },
    'logFilePath': '/var/log/app.log',
    'logFileOffset': 759,
    'message': 'GET /api/v1/forms 200 624ms',
    'method': 'GET',
    'namespace': '123-dev',
    'path': '/api/v1/forms',
    'product': 'chefs',
    'responseTime': 624,
    'statusCode': 200,
    'timestamp': '2021-07-14T23:17:05.036Z',
    'userAgent': 'Mozilla/5.0',
  };

  // expect the parser's match() method to return true and run for this test record
  expect(filter.matches(record)).toEqual(true);

  // --- run the parser:
  filter.apply(record);

  // --- test the result:
  // contentLength
  expect(record).not.toHaveProperty('contentLength');
  expect(record).toHaveProperty('http.response.body.bytes', '323');
  // hostname
  expect(record).not.toHaveProperty('hostname');
  expect(record).toHaveProperty('host.hostname', 'chefs-app-123');
  // httpVersion
  expect(record).not.toHaveProperty('httpVersion');
  expect(record).toHaveProperty('http.version', '1.1');
  // ip
  expect(record).not.toHaveProperty('ip');
  expect(record).toHaveProperty('source.address', '10.97.8.1');
  // log
  expect(record).toHaveProperty('event.original.responseTime', 624);
  // logFileOffset
  expect(record).not.toHaveProperty('logFileOffset');
  expect(record).toHaveProperty('log.file.offset', 759);
  // logFilePath
  expect(record).not.toHaveProperty('logFilePath');
  expect(record).toHaveProperty('log.file.path', '/var/log/app.log');
  // method
  expect(record).not.toHaveProperty('method');
  expect(record).toHaveProperty('http.request.method', 'GET');
  // namespace
  expect(record).not.toHaveProperty('namespace');
  expect(record).toHaveProperty('host.namespace', '123-dev');
  // path
  expect(record).not.toHaveProperty('path');
  expect(record).toHaveProperty('url.original', '/api/v1/forms');
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

  // fields already in ECS format:
  // message

  // extra fields added on top of ECS:
  // azp, level, product

  // use snapshot
  expect(record).toMatchSnapshot('2f015294-45f8-4235-949b-667236bea641');
});
