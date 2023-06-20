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
const regex_v1 = /^(?<labels__format>v1\.0) (?<service__version>[^ ]+) "(?<url__scheme>[^:]+):\/\/(?<url__domain>[^:]+):(?<url__port>\d+)" "(?<source__ip>[^"]+)" \[(?<extract_timestamp>[^\]]+)\] "(?<extract_httpRequest>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__request__bytes>(-?|\d+)) bytes (?<http__response__bytes>(-?|\d+)) bytes "(?<http__request__referrer>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)" (?<event__duration>\d+) ms, "(?<tls__version_protocol>[^"]+)" "(?<tls__cipher>[^"]+)"$/;
const regex_apache_standard01 = /^(?<source__ip>[^ ]+) ([^ ]+) (?<user__name>[^ ]+) \[(?<extract_timestamp>[^\]]+)\] "(?<extract_httpRequest>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__response__bytes>(-?|\d+)) "(?<http__request__referrer>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)" (?<event__duration>(-?|\d+))$/;
const regex_apache_standard02 = /^(?<source__ip>[^ ]+) ([^ ]+) (?<user__name>[^ ]+) \[(?<extract_timestamp>[^\]]+)\] "(?<extract_httpRequest>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__response__bytes>(-?|\d+)) "(?<http__request__referrer>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)"$/;
const regex_IIS_stanard01=/^(?<extract_timestamp>\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s((\S+)\s){2}(?<source__ip>(\S+))\s(?<http__request__method>(\S+))\s(?<url__full>(\S+))\s(\S+)\s(?<url__port>(\S+))\s(-|\S+)\s(?<client__ip>(-|\S+))\s(?<extract_httpVersion>(\S+))\s(?<user_agent__original>(\S+))\s((\S+)\s){2}(?<server__address>(\S+))\s(?<http__response__status_code>(-|\d+))\s((-|\d+)\s){2}(?<http__request__bytes>(-|\d+))\s(?<http__response__bytes>(-|\d+))\s(?<event__duration>(-|\d+)).?$/;

/* eslint-enable max-len */

const regexArr = [regex_v1, regex_apache_standard01, regex_apache_standard02, regex_IIS_stanard01];

describe('RegexService', () => {
  const logger = {
    log: jest.fn(),
    debug: jest.fn(),
  } as LoggerService;

  it('parses suspicious entry - 001', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, 'event.original': 'v1.0 20120211 "http://142.34.120.18:80" "64.114.237.115" [25/May/2021:15:53:10 -0700] "GET /WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script> HTTP/1.1" 302 347 bytes 1152 bytes "-" "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)" 1 ms, "-" "-"'}))} as unknown as OsDocument;
    const metaFields = parser.applyRegex(document, 'event.original', regexArr);
    // eslint-disable-next-line max-len
    expect(metaFields).toHaveProperty('httpRequest', 'GET /WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script> HTTP/1.1');
    expect(document.data).toHaveProperty('event.duration', '1');
    expect(document.dataExtractedTimestamp).toBe('25/May/2021:15:53:10 -0700');
    expect(document.data).toHaveProperty('service.version', '20120211');
  });

  it('parses suspicious entry - 002', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, 'event.original': 'v1.0 20120211 "http://142.34.120.21:80" "64.114.237.115" [25/May/2021:15:51:47 -0700] "GET /cgi-bin/count.cgi HTTP/1.1" 302 369 bytes 1043 bytes "-" "() { _; } >_[$($())] { echo Content-Type: text/plain ; echo ; echo \\"bash_cve_2014_6278 Output : $((10+12))\\"; }" 1 ms, "-" "-"'}))} as unknown as OsDocument;
    const metaFields = parser.applyRegex(document, 'event.original', regexArr);
    expect(metaFields).toHaveProperty('httpRequest', 'GET /cgi-bin/count.cgi HTTP/1.1');
    expect(document.dataExtractedTimestamp).toBe('25/May/2021:15:51:47 -0700');
    expect(document.data).not.toHaveProperty('http.request.referrer');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('user_agent.original', '() { _; } >_[$($())] { echo Content-Type: text/plain ; echo ; echo \\"bash_cve_2014_6278 Output : $((10+12))\\"; }');
    expect(document.data).toHaveProperty('event.duration', '1');
  });

  it('parses Apache standard format', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, 'event.original': '5.217.73.168 - - [05/Jun/2020:00:06:57 -0700] "GET /pub/eirs/viewDocumentDetail.do?fromStatic=true&repository=BDP&documentId=6612 HTTP/1.1" 200 277 "-" "AHC/2.1" 192'}))} as unknown as OsDocument;
    const metaFields = parser.applyRegex(document, 'event.original', regexArr);
    // eslint-disable-next-line max-len
    expect(metaFields).toHaveProperty('httpRequest', 'GET /pub/eirs/viewDocumentDetail.do?fromStatic=true&repository=BDP&documentId=6612 HTTP/1.1');
    expect(document.dataExtractedTimestamp).toBe('05/Jun/2020:00:06:57 -0700');
    expect(document.data).toHaveProperty('source.ip', '5.217.73.168');
    expect(document.data).toHaveProperty('http.response.status_code', '200');
    expect(document.data).toHaveProperty('http.response.bytes', '277');
    expect(document.data).not.toHaveProperty('http.request.referrer');
    expect(document.data).toHaveProperty('user_agent.original', 'AHC/2.1');
    expect(document.data).toHaveProperty('event.duration');
  });

  it('parses Apache standard format - 2', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, 'event.original': '66.183.191.120 - - [05/Jun/2020:07:23:23 -0700] "GET /ext/raad3/map?execution=e1s1&_eventId=agreed HTTP/1.1" 302 - "https://apps.nrs.gov.bc.ca/ext/raad3/map?execution=e1s1" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0" 24'}))} as unknown as OsDocument;
    const metaFields = parser.applyRegex(document, 'event.original', regexArr);
    expect(document.data).not.toHaveProperty('user.name');
    expect(document.data).toHaveProperty('source.ip', '66.183.191.120');
    expect(metaFields).toHaveProperty('httpRequest', 'GET /ext/raad3/map?execution=e1s1&_eventId=agreed HTTP/1.1');
    expect(document.data).not.toHaveProperty('http.response.bytes');
    expect(document.data).toHaveProperty('http.response.status_code', '302');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('http.request.referrer', 'https://apps.nrs.gov.bc.ca/ext/raad3/map?execution=e1s1');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('user_agent.original', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0');
    expect(document.data).toHaveProperty('event.duration');
    expect(document.dataExtractedTimestamp).toBe('05/Jun/2020:07:23:23 -0700');
  });

  it('keeps dash - 3', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, 'event.original': '66.183.191.120 - - [05/Jun/2020:07:23:23 -0700] "GET /ext/raad3/map?execution=e1s1&_eventId=agreed HTTP/1.1" 302 - "https://apps.nrs.gov.bc.ca/ext/raad3/map?execution=e1s1" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0" 24'}))} as unknown as OsDocument;
    parser.applyRegex(document, 'event.original', regexArr, false);
    expect(document.data).toHaveProperty('user.name', '-');
  });

  it('parses Windows IIS entry - 001', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, 'event.original': '2023-06-05 00:59:47 W3SVC14 Stress 142.34.2.162 GET /ftp/HTH/external/!publish/Web/publications/CPRT-Admin-Manual.pdf - 443 - 54.244.166.221 HTTP/1.1 Mozilla/5.0+(Windows+NT+10.0;+Win64;+x64)+AppleWebKit/537.36+(KHTML,+like+Gecko)+Chrome/105.0.0.0+Safari/537.36 - - testwww.for.gov.bc.ca 401 2 5 1558 270 93'}))} as unknown as OsDocument;
    /* eslint-enable max-len */
    const metaFields = parser.applyRegex(document, 'event.original', regexArr);
    expect(document.dataExtractedTimestamp).toBe('2023-06-05 00:59:47');
    expect(document.data).toHaveProperty('source.ip', '142.34.2.162');
    expect(document.data).toHaveProperty('http.request.method', 'GET');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('url.full', '/ftp/HTH/external/!publish/Web/publications/CPRT-Admin-Manual.pdf');
    expect(document.data).toHaveProperty('url.port', '443');
    expect(metaFields.httpVersion).toBe('HTTP/1.1');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('user_agent.original', 'Mozilla/5.0+(Windows+NT+10.0;+Win64;+x64)+AppleWebKit/537.36+(KHTML,+like+Gecko)+Chrome/105.0.0.0+Safari/537.36');
    expect(document.data).toHaveProperty('server.address', 'testwww.for.gov.bc.ca');
    expect(document.data).toHaveProperty('http.response.status_code', '401');
    expect(document.data).toHaveProperty('http.request.bytes', '1558');
    expect(document.data).toHaveProperty('http.response.bytes', '270');
    expect(document.data).toHaveProperty('event.duration', '93');
  });
  it('parses Windows IIS entry - 002', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, 'event.original': '2023-06-05 01:33:04 W3SVC14 Stress 142.34.2.162 GET / - 443 - 65.49.20.69 HTTP/1.1 Mozilla/5.0+(Windows+NT+10.0;+rv:109.0)+Gecko/20100101+Firefox/109.0 - - 142.34.2.162 401 2 5 1539 156 140'}))} as unknown as OsDocument;
    /* eslint-enable max-len */
    const metaFields = parser.applyRegex(document, 'event.original', regexArr);
    expect(document.dataExtractedTimestamp).toBe('2023-06-05 01:33:04');
    expect(document.data).toHaveProperty('source.ip', '142.34.2.162');
    expect(document.data).toHaveProperty('http.request.method', 'GET');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('url.full', '/');
    expect(document.data).toHaveProperty('url.port', '443');
    expect(document.data).toHaveProperty('client.ip', '65.49.20.69');
    expect(metaFields.httpVersion).toBe('HTTP/1.1');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('user_agent.original', 'Mozilla/5.0+(Windows+NT+10.0;+rv:109.0)+Gecko/20100101+Firefox/109.0');
    expect(document.data).toHaveProperty('server.address', '142.34.2.162');
    expect(document.data).toHaveProperty('http.response.status_code', '401');
    expect(document.data).toHaveProperty('http.request.bytes', '1539');
    expect(document.data).toHaveProperty('http.response.bytes', '156');
    expect(document.data).toHaveProperty('event.duration', '140');
  });
});
