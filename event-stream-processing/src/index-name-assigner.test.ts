import {IndexNameAssigner} from './index-name-assigner';
import {APACHE_ACCESS_LOG_EVENT_SIGNATURE} from './parser.apache.svc';
import * as lodash from 'lodash';

test('access log with @timestamp', () => {
  const namer = new IndexNameAssigner();
  const record = {...APACHE_ACCESS_LOG_EVENT_SIGNATURE, '@timestamp': '2021-05-01T18:47:40.314-07:00'};
  namer.apply(record);
  expect(record).toHaveProperty('_index', 'nrm-logs-access-2021.05.01');
});

test('access log without @timestamp and with event.created', () => {
  const namer = new IndexNameAssigner();
  const record = lodash.merge(
    {},
    APACHE_ACCESS_LOG_EVENT_SIGNATURE,
    {event: {created: '2021-05-02T18:47:40.314-07:00'}},
  );
  namer.apply(record);
  expect(record).toHaveProperty('_index', 'nrm-logs-access-2021.05.02');
});

test('access log without any timestamp field', () => {
  const namer = new IndexNameAssigner();
  const record = lodash.merge({}, APACHE_ACCESS_LOG_EVENT_SIGNATURE);
  delete record.event.ingested;
  expect(() => {
    namer.apply(record);
  }).toThrow('Timestamp field value has not been defined!');
});

test('metric with @timestamp', () => {
  const namer = new IndexNameAssigner();
  const record = {'@timestamp': '2021-05-01T18:47:40.314-07:00', 'event': {kind: 'metric'}};
  namer.apply(record);
  expect(record).toHaveProperty('_index', 'nrm-metrics-2021.05.01');
});

test('metric without @timestamp and with event.created', () => {
  const namer = new IndexNameAssigner();
  const record = {event: {kind: 'metric', created: '2021-05-02T18:47:40.314-07:00'}};
  namer.apply(record);
  expect(record).toHaveProperty('_index', 'nrm-metrics-2021.05.02');
});

test('custom index', () => {
  const namer = new IndexNameAssigner();
  const record = {
    'event': {kind: 'metric', created: '2021-05-02T18:47:40.314-07:00'},
    '@metadata': {index: 'blah-%{+YYYY.MM.DD}'},
  };
  namer.apply(record);
  expect(record).toHaveProperty('_index', 'blah-2021.05.02');
});

test('unexpected event', () => {
  const namer = new IndexNameAssigner();
  const record = lodash.merge({});
  expect(() => {
    namer.apply(record);
  }).toThrow('Could not map event to an index');
});
