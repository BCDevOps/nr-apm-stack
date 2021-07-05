import * as lodash from 'lodash';
import {ParserUserAgent} from './parser.ua.svc';

test('undefined', () => {
  const parser = new ParserUserAgent();
  const record:any = {};
  parser.apply(record);
  expect(record).not.toHaveProperty('user_agent');
});

test('GoogleBot', () => {
  const parser = new ParserUserAgent();
  const record:any = lodash.merge(
    {}, {user_agent: {original: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'}});
  parser.apply(record);
  expect(record).toHaveProperty('user_agent.original');
  expect(record).toHaveProperty('user_agent.name', 'Googlebot');
});

test('YandexBot', () => {
  const parser = new ParserUserAgent();
  const record:any = lodash.merge(
    {}, {user_agent: {original: 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)'}});
  parser.apply(record);
  expect(record).toHaveProperty('user_agent.original');
  expect(record).toHaveProperty('user_agent.name', 'YandexBot');
});
