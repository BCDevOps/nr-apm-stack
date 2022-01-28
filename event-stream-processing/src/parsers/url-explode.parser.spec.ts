import {OsDocument} from '../types/os-document';
import {UrlExplodeParser} from './url-explode.parser';

describe('UrlExplodeParser', () => {
  it('matches using metadata', () => {
    const parser = new UrlExplodeParser();

    expect(parser.matches({data: {'@metadata': {urlExplode: true}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('http.request.line - 01', () => {
    const parser = new UrlExplodeParser();
    const document = {data: {url: {original: '/?XDEBUG_SESSION_START=phpstorm'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('url.original', '/?XDEBUG_SESSION_START=phpstorm');
    expect(document.data).toHaveProperty('url.path', '/');
    expect(document.data).toHaveProperty('url.query', 'XDEBUG_SESSION_START=phpstorm');
  });

  it('http.request.line - 02', () => {
    const parser = new UrlExplodeParser();
    const document = {data: {url: {original: '/?XDEBUG_SESSION_START=phpstorm#fragment'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('url.original', '/?XDEBUG_SESSION_START=phpstorm#fragment');
    expect(document.data).toHaveProperty('url.path', '/');
    expect(document.data).toHaveProperty('url.query', 'XDEBUG_SESSION_START=phpstorm');
  });

  it('http.request.line - 03', () => {
    const parser = new UrlExplodeParser();
    const document = {data: {url: {original: '/ext/jcrs/rest_v2/import?update=false'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('url.original', '/ext/jcrs/rest_v2/import?update=false');
    expect(document.data).toHaveProperty('url.path', '/ext/jcrs/rest_v2/import');
    expect(document.data).toHaveProperty('url.query', 'update=false');
  });

  it('http.request.line - 04', () => {
    const parser = new UrlExplodeParser();
    // eslint-disable-next-line max-len
    const document = {data: {url: {original: '/ext/farm/farm265.do;jsessionid=JA6pko6NolLG_MPnJNoBbx75a-aAV9x99zjo0ECs1tH-VVS0waj4!1029141353'}}} as unknown as OsDocument;
    parser.apply(document);
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('url.original', '/ext/farm/farm265.do;jsessionid=JA6pko6NolLG_MPnJNoBbx75a-aAV9x99zjo0ECs1tH-VVS0waj4!1029141353');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('url.path', '/ext/farm/farm265.do;jsessionid=JA6pko6NolLG_MPnJNoBbx75a-aAV9x99zjo0ECs1tH-VVS0waj4!1029141353');
    // eslint-disable-next-line max-len
    // expect(document.data).toHaveProperty('url.path_param', 'jsessionid=JA6pko6NolLG_MPnJNoBbx75a-aAV9x99zjo0ECs1tH-VVS0waj4!1029141353');
    expect(document.data).not.toHaveProperty('url.query');
  });

  it('http.request.line - 05', () => {
    const parser = new UrlExplodeParser();
    // eslint-disable-next-line max-len
    const document = {data: {url: {original: '/pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=ACTIVEMQ.*'}}} as unknown as OsDocument;
    parser.apply(document);
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('url.original', '/pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=ACTIVEMQ.*');
    expect(document.data).toHaveProperty('url.path', '/pub/oauth2/v1/oauth/token');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('url.query', 'disableDeveloperFilter=true&grant_type=client_credentials&scope=ACTIVEMQ.*');
  });

  it('http.request.line - 06', () => {
    const parser = new UrlExplodeParser();
    // eslint-disable-next-line max-len
    const document = {data: {url: {original: '/pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=DSP.*'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('url.original',
      '/pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=DSP.*');
    expect(document.data).toHaveProperty('url.path', '/pub/oauth2/v1/oauth/token');
    expect(document.data).toHaveProperty('url.query',
      'disableDeveloperFilter=true&grant_type=client_credentials&scope=DSP.*');
  });
  it('http.request.line - 07', () => {
    const parser = new UrlExplodeParser();
    const document = {data: {url: {original: '/ext/farm/farm265.do;'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('url.original', '/ext/farm/farm265.do;');
    expect(document.data).toHaveProperty('url.path', '/ext/farm/farm265.do;');
    // expect(document.data).not.toHaveProperty('url.path_param');
    expect(document.data).not.toHaveProperty('url.query');
  });
  it('http.request.line - 08', () => {
    const parser = new UrlExplodeParser();
    // eslint-disable-next-line max-len
    const document = {data: {url: {original: '/WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script>'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('url.path', '/WebID/IISWebAgentIF.dll');
    // expect(document.data).not.toHaveProperty('url.path_param');
    expect(document.data).toHaveProperty('url.query', 'postdata=\\%22%3E%3Cscript%3Efoo%3C/script%3E');
  });
});
