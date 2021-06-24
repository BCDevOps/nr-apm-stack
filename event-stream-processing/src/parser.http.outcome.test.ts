import {create as buildContainer, TYPES} from './inversify.config';
import {Randomizer} from './randomizer.isvc';
import * as lodash from 'lodash';
import {ParserHttpStatusCodeToEventOutCome} from './parser.http.outcome';

const myContainer = buildContainer();

beforeEach(() => {
  myContainer.snapshot();
  myContainer.rebind<Randomizer>(TYPES.Randomizer).toConstantValue({randomBytes: (size: number)=>{
    return Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
  }});
});

afterEach(() => {
  myContainer.restore();
});

test('status_code > 200', async () => {
  const parser = new ParserHttpStatusCodeToEventOutCome();
  const record:any = lodash.merge({}, {http: {response: {status_code: 200}}});
  parser.apply(record);
  expect(record.event.outcome).toEqual('success');
});

test('status_code = 401', async () => {
  const parser = new ParserHttpStatusCodeToEventOutCome();
  const record:any = lodash.merge({}, {http: {response: {status_code: 401}}});
  parser.apply(record);
  expect(record.event.outcome).toEqual('success');
});

test('status_code = 403', async () => {
  const parser = new ParserHttpStatusCodeToEventOutCome();
  const record:any = lodash.merge({}, {http: {response: {status_code: 403}}});
  parser.apply(record);
  expect(record.event.outcome).toEqual('success');
});

test('status_code = 400', async () => {
  const parser = new ParserHttpStatusCodeToEventOutCome();
  const record:any = lodash.merge({}, {http: {response: {status_code: 400}}});
  parser.apply(record);
  expect(record.event.outcome).toEqual('failure');
});

test('status_code = 500', async () => {
  const parser = new ParserHttpStatusCodeToEventOutCome();
  const record:any = lodash.merge({}, {http: {response: {status_code: 500}}});
  parser.apply(record);
  expect(record.event.outcome).toEqual('failure');
});

test('status_code = 600', async () => {
  const parser = new ParserHttpStatusCodeToEventOutCome();
  const record:any = lodash.merge({}, {http: {response: {status_code: 600}}});
  parser.apply(record);
  expect(record.event.outcome).toEqual('unknown');
});
