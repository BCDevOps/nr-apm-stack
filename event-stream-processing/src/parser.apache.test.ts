import {Container} from 'inversify';
import {TYPES} from './inversify.types';
import {LoggerVoidImpl} from './logger-void.svc';
import {Logger} from './logger.isvc';
import {LoggerImpl} from './logger.svc';
import {ParserApacheImpl, APACHE_ACCESS_LOG_EVENT_SIGNATURE} from './parser.apache.svc';
import {Parser} from './parser.isvc';

const myContainer = new Container();
myContainer.bind<Parser>(TYPES.Parser).to(ParserApacheImpl);
// myContainer.bind<Logger>(TYPES.Logger).to(LoggerImpl);
myContainer.bind<Logger>(TYPES.Logger).to(LoggerVoidImpl);
test('parse suspicious entry - 001', async () => {
  const parser = myContainer.get<Parser>(TYPES.Parser);
  const record = JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: 'v1.0 20120211 "http://142.34.120.18:80" "64.114.237.115" [25/May/2021:15:53:10 -0700] "GET /WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script> HTTP/1.1" 302 347 bytes 1152 bytes "-" "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)" 1 ms, "-" "-"'}));
  parser.apply(record);
  // expect(record).toHaveProperty('@timestamp')
  expect(record).toHaveProperty('http.request.line', 'GET /WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script> HTTP/1.1');
  expect(record).toHaveProperty('event.duration', '1');
});

test('parse suspicious entry - 002', async () => {
  const parser = myContainer.get<Parser>(TYPES.Parser);
  const record = JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: 'v1.0 20120211 "http://142.34.120.21:80" "64.114.237.115" [25/May/2021:15:51:47 -0700] "GET /cgi-bin/count.cgi HTTP/1.1" 302 369 bytes 1043 bytes "-" "() { _; } >_[$($())] { echo Content-Type: text/plain ; echo ; echo \\"bash_cve_2014_6278 Output : $((10+12))\\"; }" 1 ms, "-" "-"'}));
  parser.apply(record);
  // expect(record).toHaveProperty('@timestamp')
  expect(record).toHaveProperty('http.request.line', 'GET /cgi-bin/count.cgi HTTP/1.1');
  expect(record).not.toHaveProperty('http.request.referrer.original');
  expect(record).toHaveProperty('user_agent.original', '() { _; } >_[$($())] { echo Content-Type: text/plain ; echo ; echo \\"bash_cve_2014_6278 Output : $((10+12))\\"; }');
  expect(record).toHaveProperty('event.duration', '1');
});

test('Apache standard format', async () => {
  const parser = myContainer.get<Parser>(TYPES.Parser);
  const record = JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: '5.217.73.168 - - [05/Jun/2020:00:06:57 -0700] "GET /pub/eirs/viewDocumentDetail.do?fromStatic=true&repository=BDP&documentId=6612 HTTP/1.1" 200 277 "-" "AHC/2.1" 192'}));
  parser.apply(record);
  expect(record).toHaveProperty('@timestamp');
  expect(record).toHaveProperty('source.ip', '5.217.73.168');
  expect(record).toHaveProperty('http.request.line', 'GET /pub/eirs/viewDocumentDetail.do?fromStatic=true&repository=BDP&documentId=6612 HTTP/1.1');
  expect(record).toHaveProperty('http.response.status_code', '200');
  expect(record).toHaveProperty('http.response.bytes', '277');
  expect(record).not.toHaveProperty('http.request.referrer.original');
  expect(record).toHaveProperty('user_agent.original', 'AHC/2.1');
  expect(record).toHaveProperty('event.duration');
});

test('Apache standard format - 2', async () => {
  const parser = myContainer.get<Parser>(TYPES.Parser);
  const record = JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: '66.183.191.120 - - [05/Jun/2020:07:23:23 -0700] "GET /ext/raad3/map?execution=e1s1&_eventId=agreed HTTP/1.1" 302 - "https://apps.nrs.gov.bc.ca/ext/raad3/map?execution=e1s1" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0" 24'}));
  parser.apply(record);
  expect(record).toHaveProperty('@timestamp');
  expect(record).toHaveProperty('source.ip', '66.183.191.120');
  expect(record).toHaveProperty('http.request.line', 'GET /ext/raad3/map?execution=e1s1&_eventId=agreed HTTP/1.1');
  expect(record).toHaveProperty('http.response.status_code', '302');
  expect(record).not.toHaveProperty('http.response.bytes');
  expect(record).toHaveProperty('http.request.referrer.original', 'https://apps.nrs.gov.bc.ca/ext/raad3/map?execution=e1s1');
  expect(record).toHaveProperty('user_agent.original', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0');
  expect(record).toHaveProperty('event.duration');
});
