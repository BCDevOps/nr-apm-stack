import {RegexService} from './regex.service';
import {LoggerService} from '../util/logger.service';
import {OsDocument} from '../types/os-document';

const APACHE_ACCESS_LOG_EVENT_SIGNATURE = Object.freeze({
  event: Object.freeze({
    'kind': 'event',
    'category': 'web',
    'dataset': 'apache.access',
    'ingested': '2021-05-26T18:47:40.314-07:00',
    '@metadata': {
      apacheAccessLog: true,
    },
  }),
});

/* eslint-disable max-len,camelcase,@typescript-eslint/no-unsafe-call */
const regex_v1 = /^(?<labels__format>v1\.0) (?<apache__version>[^ ]+) "(?<url__scheme>[^:]+):\/\/(?<url__domain>[^:]+):(?<url__port>\d+)" "(?<client__ip>[^"]+)" \[(?<apache__access__time>[^\]]+)\] "(?<http__request__line>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__request__bytes>(-?|\d+)) bytes (?<http__response__bytes>(-?|\d+)) bytes "(?<http__request__referrer__original>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)" (?<event__duration>\d+) ms, "(?<tls__version_protocol>[^"]+)" "(?<tls__cypher>[^"]+)"$/;
const regex_apache_standard01 = /^(?<source__ip>[^ ]+) ([^ ]+) (?<user__name>[^ ]+) \[(?<apache__access__time>[^\]]+)\] "(?<http__request__line>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__response__bytes>(-?|\d+)) "(?<http__request__referrer__original>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)" (?<event__duration>(-?|\d+))$/;
const regex_apache_standard02 = /^(?<source__ip>[^ ]+) ([^ ]+) (?<user__name>[^ ]+) \[(?<apache__access__time>[^\]]+)\] "(?<http__request__line>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__response__bytes>(-?|\d+)) "(?<http__request__referrer__original>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)"$/;
/* eslint-enable max-len */

const regexArr = [regex_v1, regex_apache_standard01, regex_apache_standard02];

describe('RegexService', () => {
  const logger = {
    log: jest.fn(),
    debug: jest.fn(),
  } as LoggerService;

  it('parses suspicious entry - 001', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: 'v1.0 20120211 "http://142.34.120.18:80" "64.114.237.115" [25/May/2021:15:53:10 -0700] "GET /WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script> HTTP/1.1" 302 347 bytes 1152 bytes "-" "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)" 1 ms, "-" "-"'}))} as unknown as OsDocument;
    parser.applyRegex(document, 'message', regexArr);
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('http.request.line', 'GET /WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script> HTTP/1.1');
    expect(document.data).toHaveProperty('event.duration', '1');
  });

  it('parses suspicious entry - 002', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: 'v1.0 20120211 "http://142.34.120.21:80" "64.114.237.115" [25/May/2021:15:51:47 -0700] "GET /cgi-bin/count.cgi HTTP/1.1" 302 369 bytes 1043 bytes "-" "() { _; } >_[$($())] { echo Content-Type: text/plain ; echo ; echo \\"bash_cve_2014_6278 Output : $((10+12))\\"; }" 1 ms, "-" "-"'}))} as unknown as OsDocument;
    parser.applyRegex(document, 'message', regexArr);
    expect(document.data).toHaveProperty('http.request.line', 'GET /cgi-bin/count.cgi HTTP/1.1');
    expect(document.data).not.toHaveProperty('http.request.referrer.original');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('user_agent.original', '() { _; } >_[$($())] { echo Content-Type: text/plain ; echo ; echo \\"bash_cve_2014_6278 Output : $((10+12))\\"; }');
    expect(document.data).toHaveProperty('event.duration', '1');
  });

  it('parses Apache standard format', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: '5.217.73.168 - - [05/Jun/2020:00:06:57 -0700] "GET /pub/eirs/viewDocumentDetail.do?fromStatic=true&repository=BDP&documentId=6612 HTTP/1.1" 200 277 "-" "AHC/2.1" 192'}))} as unknown as OsDocument;
    parser.applyRegex(document, 'message', regexArr);
    expect(document.data).toHaveProperty('source.ip', '5.217.73.168');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('http.request.line', 'GET /pub/eirs/viewDocumentDetail.do?fromStatic=true&repository=BDP&documentId=6612 HTTP/1.1');
    expect(document.data).toHaveProperty('http.response.status_code', '200');
    expect(document.data).toHaveProperty('http.response.bytes', '277');
    expect(document.data).not.toHaveProperty('http.request.referrer.original');
    expect(document.data).toHaveProperty('user_agent.original', 'AHC/2.1');
    expect(document.data).toHaveProperty('event.duration');
  });

  it('parses Apache standard format - 2', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: '66.183.191.120 - - [05/Jun/2020:07:23:23 -0700] "GET /ext/raad3/map?execution=e1s1&_eventId=agreed HTTP/1.1" 302 - "https://apps.nrs.gov.bc.ca/ext/raad3/map?execution=e1s1" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0" 24'}))} as unknown as OsDocument;
    parser.applyRegex(document, 'message', regexArr);
    expect(document.data).not.toHaveProperty('user.name');
    expect(document.data).toHaveProperty('source.ip', '66.183.191.120');
    expect(document.data).toHaveProperty(
      'http.request.line', 'GET /ext/raad3/map?execution=e1s1&_eventId=agreed HTTP/1.1');
    expect(document.data).not.toHaveProperty('http.response.bytes');
    expect(document.data).toHaveProperty('http.response.status_code', '302');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('http.request.referrer.original', 'https://apps.nrs.gov.bc.ca/ext/raad3/map?execution=e1s1');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('user_agent.original', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0');
    expect(document.data).toHaveProperty('event.duration');
  });

  it('keeps dash - 3', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: '66.183.191.120 - - [05/Jun/2020:07:23:23 -0700] "GET /ext/raad3/map?execution=e1s1&_eventId=agreed HTTP/1.1" 302 - "https://apps.nrs.gov.bc.ca/ext/raad3/map?execution=e1s1" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0" 24'}))} as unknown as OsDocument;
    parser.applyRegex(document, 'message', regexArr, false);
    expect(document.data).toHaveProperty('user.name', '-');
  });
});
