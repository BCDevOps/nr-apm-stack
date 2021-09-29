import {OsDocument} from '../types/os-document';
import {HttpUrlParser} from './http-url.parser';

describe('HttpUrlParser', () => {
  it('referrer - none', () => {
    const parser = new HttpUrlParser();
    const document = {data: {http: {request: {referrer: {original: '-'}}}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).not.toHaveProperty('http.request.referrer.original');
    expect(document.data).not.toHaveProperty('http.request.referrer.scheme');
    expect(document.data).not.toHaveProperty('http.request.referrer.domain');
    expect(document.data).not.toHaveProperty('http.request.referrer.path');
    expect(document.data).not.toHaveProperty('http.request.referrer.port');
    expect(document.data).not.toHaveProperty('http.request.referrer.username');
    expect(document.data).not.toHaveProperty('http.request.referrer.query');
    expect(document.data).not.toHaveProperty('http.request.referrer.fragment');
  });

  it('referrer - simple', () => {
    const parser = new HttpUrlParser();
    const document = {
      data: {http: {request: {referrer: {original: 'http://somewhere.com/with/some/path.ext'}}}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.referrer.original');
    expect(document.data).toHaveProperty('http.request.referrer.scheme');
    expect(document.data).toHaveProperty('http.request.referrer.domain');
    expect(document.data).toHaveProperty('http.request.referrer.port');
    expect(document.data).toHaveProperty('http.request.referrer.path');
    expect(document.data).not.toHaveProperty('http.request.referrer.username');
    expect(document.data).not.toHaveProperty('http.request.referrer.query');
    expect(document.data).not.toHaveProperty('http.request.referrer.fragment');
  });

  it('referrer - https', () => {
    const parser = new HttpUrlParser();
    const document = {
      data: {http: {request: {referrer: {original: 'https://somewhere.com/with/some/path.ext'}}}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.referrer.original');
    expect(document.data).toHaveProperty('http.request.referrer.scheme');
    expect(document.data).toHaveProperty('http.request.referrer.domain');
    expect(document.data).toHaveProperty('http.request.referrer.port');
    expect(document.data).toHaveProperty('http.request.referrer.path');
    expect(document.data).not.toHaveProperty('http.request.referrer.username');
    expect(document.data).not.toHaveProperty('http.request.referrer.query');
    expect(document.data).not.toHaveProperty('http.request.referrer.fragment');
  });

  it('referrer - ws', () => {
    const parser = new HttpUrlParser();
    const document = {
      data: {http: {request: {referrer: {original: 'ws://somewhere.com/with/some/path.ext'}}}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.referrer.original');
    expect(document.data).toHaveProperty('http.request.referrer.scheme');
    expect(document.data).toHaveProperty('http.request.referrer.domain');
    expect(document.data).toHaveProperty('http.request.referrer.port');
    expect(document.data).toHaveProperty('http.request.referrer.path');
    expect(document.data).not.toHaveProperty('http.request.referrer.username');
    expect(document.data).not.toHaveProperty('http.request.referrer.query');
    expect(document.data).not.toHaveProperty('http.request.referrer.fragment');
  });

  it('referrer - wss 1', () => {
    const parser = new HttpUrlParser();
    const document = {
      data: {http: {request: {referrer: {original: 'ws://somewhere.com/with/some/path.ext'}}}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.referrer.original');
    expect(document.data).toHaveProperty('http.request.referrer.scheme');
    expect(document.data).toHaveProperty('http.request.referrer.domain');
    expect(document.data).toHaveProperty('http.request.referrer.port');
    expect(document.data).toHaveProperty('http.request.referrer.path');
    expect(document.data).not.toHaveProperty('http.request.referrer.username');
    expect(document.data).not.toHaveProperty('http.request.referrer.query');
    expect(document.data).not.toHaveProperty('http.request.referrer.fragment');
  });

  it('referrer - wss 2', () => {
    const parser = new HttpUrlParser();
    const document = {
      data: {http: {request: {referrer: {original: 'ftp://somewhere.com/with/some/path.ext'}}}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.referrer.original');
    expect(document.data).toHaveProperty('http.request.referrer.scheme');
    expect(document.data).toHaveProperty('http.request.referrer.domain');
    expect(document.data).toHaveProperty('http.request.referrer.port');
    expect(document.data).toHaveProperty('http.request.referrer.path');
    expect(document.data).not.toHaveProperty('http.request.referrer.username');
    expect(document.data).not.toHaveProperty('http.request.referrer.query');
    expect(document.data).not.toHaveProperty('http.request.referrer.fragment');
  });

  it('referrer - wss 3', () => {
    const parser = new HttpUrlParser();
    const document = {
      data: {http: {request: {referrer: {original: 'FiSh://somewhere.com/with/some/path.ext'}}}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.referrer.original');
    expect(document.data).toHaveProperty('http.request.referrer.scheme', 'fish');
    expect(document.data).toHaveProperty('http.request.referrer.domain', 'somewhere.com');
    expect(document.data).toHaveProperty('http.request.referrer.path', '/with/some/path.ext');
    expect(document.data).not.toHaveProperty('http.request.referrer.port');
    expect(document.data).not.toHaveProperty('http.request.referrer.username');
    expect(document.data).not.toHaveProperty('http.request.referrer.query');
    expect(document.data).not.toHaveProperty('http.request.referrer.fragment');
  });

  it('referrer - no path', () => {
    const parser = new HttpUrlParser();
    const document = {data: {http: {request: {referrer: {original: 'http://somewhere.com'}}}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.referrer.original');
    expect(document.data).toHaveProperty('http.request.referrer.scheme');
    expect(document.data).toHaveProperty('http.request.referrer.domain');
    expect(document.data).toHaveProperty('http.request.referrer.port');
    expect(document.data).toHaveProperty('http.request.referrer.path');
    expect(document.data.http.request.referrer.path).toMatch(/^\//);
    expect(document.data).not.toHaveProperty('http.request.referrer.username');
    expect(document.data).not.toHaveProperty('http.request.referrer.query');
    expect(document.data).not.toHaveProperty('http.request.referrer.fragment');
  });

  it('referrer - path with just /', () => {
    const parser = new HttpUrlParser();
    const document = {
      data: {http: {request: {referrer: {original: 'http://somewhere.com/'}}}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.referrer.original');
    expect(document.data).toHaveProperty('http.request.referrer.scheme');
    expect(document.data).toHaveProperty('http.request.referrer.domain');
    expect(document.data).toHaveProperty('http.request.referrer.port');
    expect(document.data.http.request.referrer.port).toEqual('80');
    expect(document.data).toHaveProperty('http.request.referrer.path');
    expect(document.data.http.request.referrer.path).toMatch(/^\//);
    expect(document.data).not.toHaveProperty('http.request.referrer.username');
    expect(document.data).not.toHaveProperty('http.request.referrer.query');
    expect(document.data).not.toHaveProperty('http.request.referrer.fragment');
  });

  it('referrer - full', () => {
    const parser = new HttpUrlParser();
    // eslint-disable-next-line max-len
    const document = {data: {http: {request: {referrer: {original: 'http://username:password@somewhere.com:8080/with/some/path.ext?this=that#fragment'}}}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.http.request.referrer.port).toEqual('8080');
  });

  it('http.request.line - 01', () => {
    const parser = new HttpUrlParser();
    // eslint-disable-next-line max-len
    const document = {data: {http: {request: {line: 'GET /?XDEBUG_SESSION_START=phpstorm HTTP/1.1'}}, url: {scheme: 'https', port: '443', domain: 'localhost'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.method', 'GET');
    expect(document.data).toHaveProperty('http.version', '1.1');
    expect(document.data).toHaveProperty('url.original', '/?XDEBUG_SESSION_START=phpstorm');
    expect(document.data).toHaveProperty('url.path', '/');
    expect(document.data).toHaveProperty('url.query', 'XDEBUG_SESSION_START=phpstorm');
  });

  it('http.request.line - 02', () => {
    const parser = new HttpUrlParser();
    // eslint-disable-next-line max-len
    const document = {data: {http: {request: {line: 'GET /?XDEBUG_SESSION_START=phpstorm#fragment HTTP/1.1'}}, url: {scheme: 'https', port: '443', domain: 'localhost'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.method', 'GET');
    expect(document.data).toHaveProperty('http.version', '1.1');
    expect(document.data).toHaveProperty('url.original', '/?XDEBUG_SESSION_START=phpstorm#fragment');
    expect(document.data).toHaveProperty('url.path', '/');
    expect(document.data).toHaveProperty('url.query', 'XDEBUG_SESSION_START=phpstorm');
  });

  it('http.request.line - 03', () => {
    const parser = new HttpUrlParser();
    // eslint-disable-next-line max-len
    const document = {data: {http: {request: {line: 'POST /ext/jcrs/rest_v2/import?update=false HTTP/1.1'}}, url: {scheme: 'https', port: '443', domain: 'localhost'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.method', 'POST');
    expect(document.data).toHaveProperty('http.version', '1.1');
    expect(document.data).toHaveProperty('url.original', '/ext/jcrs/rest_v2/import?update=false');
    expect(document.data).toHaveProperty('url.path', '/ext/jcrs/rest_v2/import');
    expect(document.data).toHaveProperty('url.query', 'update=false');
  });

  it('http.request.line - 04', () => {
    const parser = new HttpUrlParser();
    // eslint-disable-next-line max-len
    const document = {data: {http: {request: {line: 'GET /ext/farm/farm265.do;jsessionid=JA6pko6NolLG_MPnJNoBbx75a-aAV9x99zjo0ECs1tH-VVS0waj4!1029141353 HTTP/1.1'}}, url: {scheme: 'https', port: '443', domain: 'localhost'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.method', 'GET');
    expect(document.data).toHaveProperty('http.version', '1.1');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('url.original', '/ext/farm/farm265.do;jsessionid=JA6pko6NolLG_MPnJNoBbx75a-aAV9x99zjo0ECs1tH-VVS0waj4!1029141353');
    expect(document.data).toHaveProperty('url.path', '/ext/farm/farm265.do');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('url.path_param', 'jsessionid=JA6pko6NolLG_MPnJNoBbx75a-aAV9x99zjo0ECs1tH-VVS0waj4!1029141353');
    expect(document.data).toHaveProperty('url.file.directory', '/ext/farm');
    expect(document.data).not.toHaveProperty('url.query');
  });

  it('http.request.line - 05', () => {
    const parser = new HttpUrlParser();
    // eslint-disable-next-line max-len
    const document = {data: {http: {request: {line: 'GET /pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=ACTIVEMQ.* HTTP/1.1'}}, url: {scheme: 'https', port: '443', domain: 'localhost'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.method', 'GET');
    expect(document.data).toHaveProperty('http.version', '1.1');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('url.original', '/pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=ACTIVEMQ.*');
    expect(document.data).toHaveProperty('url.path', '/pub/oauth2/v1/oauth/token');
    expect(document.data).toHaveProperty('url.file.directory', '/pub/oauth2/v1/oauth');
    // eslint-disable-next-line max-len
    expect(document.data).toHaveProperty('url.query', 'disableDeveloperFilter=true&grant_type=client_credentials&scope=ACTIVEMQ.*');
  });

  it('http.request.line - 06', () => {
    const parser = new HttpUrlParser();
    // eslint-disable-next-line max-len
    const document = {data: {http: {request: {line: 'GET /pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=DSP.* HTTP/1.1'}}, url: {scheme: 'https', port: '443', domain: 'localhost'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.method', 'GET');
    expect(document.data).toHaveProperty('http.version', '1.1');
    expect(document.data).toHaveProperty('url.original',
      '/pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=DSP.*');
    expect(document.data).toHaveProperty('url.path', '/pub/oauth2/v1/oauth/token');
    expect(document.data).toHaveProperty('url.query',
      'disableDeveloperFilter=true&grant_type=client_credentials&scope=DSP.*');
  });
  it('http.request.line - 07', () => {
    const parser = new HttpUrlParser();
    // eslint-disable-next-line max-len
    const document = {data: {http: {request: {line: 'GET /ext/farm/farm265.do; HTTP/1.1'}}, url: {scheme: 'https', port: '443', domain: 'localhost'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.method', 'GET');
    expect(document.data).toHaveProperty('http.version', '1.1');
    expect(document.data).toHaveProperty('url.original', '/ext/farm/farm265.do;');
    expect(document.data).toHaveProperty('url.path', '/ext/farm/farm265.do');
    expect(document.data).not.toHaveProperty('url.path_param');
    expect(document.data).not.toHaveProperty('url.query');
  });
  it('http.request.line - 08', () => {
    const parser = new HttpUrlParser();
    // eslint-disable-next-line max-len
    const document = {data: {http: {request: {line: 'GET /WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script> HTTP/1.1'}}, url: {scheme: 'https', port: '443', domain: 'localhost'}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('http.request.method', 'GET');
    expect(document.data).toHaveProperty('http.version', '1.1');
    expect(document.data).toHaveProperty('url.original', '/WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script>');
    expect(document.data).toHaveProperty('url.path', '/WebID/IISWebAgentIF.dll');
    expect(document.data).not.toHaveProperty('url.path_param');
    expect(document.data).toHaveProperty('url.query', 'postdata=\\%22%3E%3Cscript%3Efoo%3C/script%3E');
  });
});
