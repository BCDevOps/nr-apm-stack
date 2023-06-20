import {RegexService} from './regex.service';
import {LoggerService} from '../util/logger.service';
import {OsDocument} from '../types/os-document';

const WIN_IIS_ACCESS_LOG_EVENT_SIGNATURE = Object.freeze({
  event: Object.freeze({
    'kind': 'event',
    'category': 'web',
    'dataset': 'iis.access',
    '@metadata': {
      iisAccessLog: true,
    },
  }),
});

/* eslint-disable max-len,camelcase,@typescript-eslint/no-unsafe-call */
const regex01=/^(?<extract_timestamp>\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s((\S+)\s){2}(?<source__ip>(\S+))\s(?<http__request__method>(\S+))\s(?<url__full>(\S+))\s(\S+)\s(?<url__port>(\S+))\s(-|\S+)\s(?<client__ip>(-|\S+))\s(?<extract_httpVersion>(\S+))\s(?<user_agent__original>(\S+))\s((\S+)\s){2}(?<server__address>(\S+))\s(?<http__response__status_code>(-|\d+))\s((-|\d+)\s){2}(?<http__request__bytes>(-|\d+))\s(?<http__response__bytes>(-|\d+))\s(?<event__duration>(-|\d+)).?$/;
/* eslint-enable max-len */

const regexArr = [regex01];

describe('RegexService', () => {
  const logger = {
    log: jest.fn(),
    debug: jest.fn(),
  } as LoggerService;

  it('parses suspicious entry - 001', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...WIN_IIS_ACCESS_LOG_EVENT_SIGNATURE, 'event.original': '2023-06-05 00:59:47 W3SVC14 Stress 142.34.2.162 GET /ftp/HTH/external/!publish/Web/publications/CPRT-Admin-Manual.pdf - 443 - 54.244.166.221 HTTP/1.1 Mozilla/5.0+(Windows+NT+10.0;+Win64;+x64)+AppleWebKit/537.36+(KHTML,+like+Gecko)+Chrome/105.0.0.0+Safari/537.36 - - testwww.for.gov.bc.ca 401 2 5 1558 270 93'}))} as unknown as OsDocument;
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
  it('parses suspicious entry - 002', () => {
    const parser = new RegexService(logger);
    // eslint-disable-next-line max-len
    const document = {data: JSON.parse(JSON.stringify({...WIN_IIS_ACCESS_LOG_EVENT_SIGNATURE, 'event.original': '2023-06-05 01:33:04 W3SVC14 Stress 142.34.2.162 GET / - 443 - 65.49.20.69 HTTP/1.1 Mozilla/5.0+(Windows+NT+10.0;+rv:109.0)+Gecko/20100101+Firefox/109.0 - - 142.34.2.162 401 2 5 1539 156 140'}))} as unknown as OsDocument;
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
