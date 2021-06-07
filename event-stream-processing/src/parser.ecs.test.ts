import { create as buildContainer, TYPES } from "./inversify.config";
import { Randomizer } from "./randomizer.isvc";
import { ParserEcs } from "./parser.ecs.svc";

const myContainer = buildContainer()

beforeEach(() => {
    myContainer.snapshot();
    myContainer.rebind<Randomizer>(TYPES.Randomizer).toConstantValue({randomBytes:(size: number)=>{ return Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])}})
})

afterEach(() => {
    myContainer.restore();
})

test('ecs - fix log file path', async () => {
    const parser = new ParserEcs()
    const record = {log:{file:{path:'C:\\windows\\file\\path'}}}
    parser.apply(record)
    expect(record).toHaveProperty('log.file.path', 'C:/windows/file/path')
});

test('ecs - referrer - none', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{referrer:{original:'-'}}}}
    parser.apply(record)
    expect(record).not.toHaveProperty('http.request.referrer.original')
    expect(record).not.toHaveProperty('http.request.referrer.scheme')
    expect(record).not.toHaveProperty('http.request.referrer.domain')
    expect(record).not.toHaveProperty('http.request.referrer.path')
    expect(record).not.toHaveProperty('http.request.referrer.port')
    expect(record).not.toHaveProperty('http.request.referrer.username')
    expect(record).not.toHaveProperty('http.request.referrer.query')
    expect(record).not.toHaveProperty('http.request.referrer.fragment')
    //await expect(record).toMatchSnapshot('9cf7ae9d-2410-464e-9ec6-65d3241dbe8a')
});

test('ecs - referrer - simple', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{referrer:{original:'http://somewhere.com/with/some/path.ext'}}}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.referrer.original')
    expect(record).toHaveProperty('http.request.referrer.scheme')
    expect(record).toHaveProperty('http.request.referrer.domain')
    expect(record).toHaveProperty('http.request.referrer.port')
    expect(record).toHaveProperty('http.request.referrer.path')
    expect(record).not.toHaveProperty('http.request.referrer.username')
    expect(record).not.toHaveProperty('http.request.referrer.query')
    expect(record).not.toHaveProperty('http.request.referrer.fragment')
    //await expect(record).toMatchSnapshot('9cf7ae9d-2410-464e-9ec6-65d3241dbe8a')
});

test('ecs - referrer - https', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{referrer:{original:'https://somewhere.com/with/some/path.ext'}}}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.referrer.original')
    expect(record).toHaveProperty('http.request.referrer.scheme')
    expect(record).toHaveProperty('http.request.referrer.domain')
    expect(record).toHaveProperty('http.request.referrer.port')
    expect(record).toHaveProperty('http.request.referrer.path')
    expect(record).not.toHaveProperty('http.request.referrer.username')
    expect(record).not.toHaveProperty('http.request.referrer.query')
    expect(record).not.toHaveProperty('http.request.referrer.fragment')
    //await expect(record).toMatchSnapshot('9cf7ae9d-2410-464e-9ec6-65d3241dbe8a')
});

test('ecs - referrer - ws', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{referrer:{original:'ws://somewhere.com/with/some/path.ext'}}}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.referrer.original')
    expect(record).toHaveProperty('http.request.referrer.scheme')
    expect(record).toHaveProperty('http.request.referrer.domain')
    expect(record).toHaveProperty('http.request.referrer.port')
    expect(record).toHaveProperty('http.request.referrer.path')
    expect(record).not.toHaveProperty('http.request.referrer.username')
    expect(record).not.toHaveProperty('http.request.referrer.query')
    expect(record).not.toHaveProperty('http.request.referrer.fragment')
    //await expect(record).toMatchSnapshot('9cf7ae9d-2410-464e-9ec6-65d3241dbe8a')
});

test('ecs - referrer - wss', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{referrer:{original:'ws://somewhere.com/with/some/path.ext'}}}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.referrer.original')
    expect(record).toHaveProperty('http.request.referrer.scheme')
    expect(record).toHaveProperty('http.request.referrer.domain')
    expect(record).toHaveProperty('http.request.referrer.port')
    expect(record).toHaveProperty('http.request.referrer.path')
    expect(record).not.toHaveProperty('http.request.referrer.username')
    expect(record).not.toHaveProperty('http.request.referrer.query')
    expect(record).not.toHaveProperty('http.request.referrer.fragment')
    //await expect(record).toMatchSnapshot('9cf7ae9d-2410-464e-9ec6-65d3241dbe8a')
});

test('ecs - referrer - wss', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{referrer:{original:'ftp://somewhere.com/with/some/path.ext'}}}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.referrer.original')
    expect(record).toHaveProperty('http.request.referrer.scheme')
    expect(record).toHaveProperty('http.request.referrer.domain')
    expect(record).toHaveProperty('http.request.referrer.port')
    expect(record).toHaveProperty('http.request.referrer.path')
    expect(record).not.toHaveProperty('http.request.referrer.username')
    expect(record).not.toHaveProperty('http.request.referrer.query')
    expect(record).not.toHaveProperty('http.request.referrer.fragment')
    //await expect(record).toMatchSnapshot('9cf7ae9d-2410-464e-9ec6-65d3241dbe8a')
});

test('ecs - referrer - wss', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{referrer:{original:'FiSh://somewhere.com/with/some/path.ext'}}}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.referrer.original')
    expect(record).toHaveProperty('http.request.referrer.scheme', 'fish')
    expect(record).toHaveProperty('http.request.referrer.domain', 'somewhere.com')
    expect(record).toHaveProperty('http.request.referrer.path', '/with/some/path.ext')
    expect(record).not.toHaveProperty('http.request.referrer.port')
    expect(record).not.toHaveProperty('http.request.referrer.username')
    expect(record).not.toHaveProperty('http.request.referrer.query')
    expect(record).not.toHaveProperty('http.request.referrer.fragment')
    //await expect(record).toMatchSnapshot('9cf7ae9d-2410-464e-9ec6-65d3241dbe8a')
});

test('ecs - referrer - no path', async () => {
    const parser = new ParserEcs()
    const record: any = {http:{request:{referrer:{original:'http://somewhere.com'}}}}
    const matches = parser.matches(record)
    parser.apply(record)
    expect(matches).toEqual(true)
    expect(record).toHaveProperty('http.request.referrer.original')
    expect(record).toHaveProperty('http.request.referrer.scheme')
    expect(record).toHaveProperty('http.request.referrer.domain')
    expect(record).toHaveProperty('http.request.referrer.port')
    expect(record).toHaveProperty('http.request.referrer.path')
    expect(record.http.request.referrer.path).toMatch(/^\//)
    expect(record).not.toHaveProperty('http.request.referrer.username')
    expect(record).not.toHaveProperty('http.request.referrer.query')
    expect(record).not.toHaveProperty('http.request.referrer.fragment')
    await expect(record).toMatchSnapshot('fe3a90a4-1319-44e0-af0f-312686d81ae7')
});

test('ecs - referrer - path with just /', async () => {
    const parser = new ParserEcs()
    const record:any = {http:{request:{referrer:{original:'http://somewhere.com/'}}}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.referrer.original')
    expect(record).toHaveProperty('http.request.referrer.scheme')
    expect(record).toHaveProperty('http.request.referrer.domain')
    expect(record).toHaveProperty('http.request.referrer.port')
    expect(record.http.request.referrer.port).toEqual('80')
    expect(record).toHaveProperty('http.request.referrer.path')
    expect(record.http.request.referrer.path).toMatch(/^\//)
    expect(record).not.toHaveProperty('http.request.referrer.username')
    expect(record).not.toHaveProperty('http.request.referrer.query')
    expect(record).not.toHaveProperty('http.request.referrer.fragment')
    await expect(record).toMatchSnapshot('84023bc4-77fe-439f-9123-91c20362c04a')
});

test('ecs - referrer - full', async () => {
    const parser = new ParserEcs()
    const record: any = {http:{request:{referrer:{original:'http://username:password@somewhere.com:8080/with/some/path.ext?this=that#fragment'}}}}
    parser.apply(record)
    expect(record.http.request.referrer.port).toEqual('8080')
    await expect(record).toMatchSnapshot('00abcd8b-a685-44ab-a5ef-b43ce489d6cd')
});

test('ecs - http.request.line - 01', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{line:"GET /?XDEBUG_SESSION_START=phpstorm HTTP/1.1"}}, url:{scheme: 'https', port: "443", domain: 'localhost'}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.method', 'GET')
    expect(record).toHaveProperty('http.version', '1.1')
    expect(record).toHaveProperty('url.original', '/?XDEBUG_SESSION_START=phpstorm')
    expect(record).toHaveProperty('url.path', '/')
    expect(record).toHaveProperty('url.query', 'XDEBUG_SESSION_START=phpstorm')
});

test('ecs - http.request.line - 02', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{line:"GET /?XDEBUG_SESSION_START=phpstorm#fragment HTTP/1.1"}}, url:{scheme: 'https', port: "443", domain: 'localhost'}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.method', 'GET')
    expect(record).toHaveProperty('http.version', '1.1')
    expect(record).toHaveProperty('url.original', '/?XDEBUG_SESSION_START=phpstorm#fragment')
    expect(record).toHaveProperty('url.path', '/')
    expect(record).toHaveProperty('url.query', 'XDEBUG_SESSION_START=phpstorm')

});

test('ecs - http.request.line - 03', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{line:"POST /ext/jcrs/rest_v2/import?update=false HTTP/1.1"}}, url:{scheme: 'https', port: "443", domain: 'localhost'}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.method', 'POST')
    expect(record).toHaveProperty('http.version', '1.1')
    expect(record).toHaveProperty('url.original', '/ext/jcrs/rest_v2/import?update=false')
    expect(record).toHaveProperty('url.path', '/ext/jcrs/rest_v2/import')
    expect(record).toHaveProperty('url.query', 'update=false')
});

test('ecs - http.request.line - 04', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{line:"GET /ext/farm/farm265.do;jsessionid=JA6pko6NolLG_MPnJNoBbx75a-aAV9x99zjo0ECs1tH-VVS0waj4!1029141353 HTTP/1.1"}}, url:{scheme: 'https', port: "443", domain: 'localhost'}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.method', 'GET')
    expect(record).toHaveProperty('http.version', '1.1')
    expect(record).toHaveProperty('url.original', '/ext/farm/farm265.do;jsessionid=JA6pko6NolLG_MPnJNoBbx75a-aAV9x99zjo0ECs1tH-VVS0waj4!1029141353')
    expect(record).toHaveProperty('url.path', '/ext/farm/farm265.do')
    expect(record).toHaveProperty('url.path_param', 'jsessionid=JA6pko6NolLG_MPnJNoBbx75a-aAV9x99zjo0ECs1tH-VVS0waj4!1029141353')
    expect(record).toHaveProperty('url.file.directory', '/ext/farm')
    expect(record).not.toHaveProperty('url.query')
});

test('ecs - http.request.line - 05', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{line:"GET /pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=ACTIVEMQ.* HTTP/1.1"}}, url:{scheme: 'https', port: "443", domain: 'localhost'}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.method', 'GET')
    expect(record).toHaveProperty('http.version', '1.1')
    expect(record).toHaveProperty('url.original', '/pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=ACTIVEMQ.*')
    expect(record).toHaveProperty('url.path', '/pub/oauth2/v1/oauth/token')
    expect(record).toHaveProperty('url.file.directory', '/pub/oauth2/v1/oauth')
    expect(record).toHaveProperty('url.query', 'disableDeveloperFilter=true&grant_type=client_credentials&scope=ACTIVEMQ.*')
});

test('ecs - http.request.line - 06', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{line:"GET /pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=DSP.* HTTP/1.1"}}, url:{scheme: 'https', port: "443", domain: 'localhost'}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.method', 'GET')
    expect(record).toHaveProperty('http.version', '1.1')
    expect(record).toHaveProperty('url.original', '/pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&grant_type=client_credentials&scope=DSP.*')
    expect(record).toHaveProperty('url.path', '/pub/oauth2/v1/oauth/token')
    expect(record).toHaveProperty('url.query', 'disableDeveloperFilter=true&grant_type=client_credentials&scope=DSP.*')
});
test('ecs - http.request.line - 07', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{line:"GET /ext/farm/farm265.do; HTTP/1.1"}}, url:{scheme: 'https', port: "443", domain: 'localhost'}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.method', 'GET')
    expect(record).toHaveProperty('http.version', '1.1')
    expect(record).toHaveProperty('url.original', '/ext/farm/farm265.do;')
    expect(record).toHaveProperty('url.path', '/ext/farm/farm265.do')
    expect(record).not.toHaveProperty('url.path_param')
    expect(record).not.toHaveProperty('url.query')
});
test('ecs - http.request.line - 08', async () => {
    const parser = new ParserEcs()
    const record = {http:{request:{line:'GET /WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script> HTTP/1.1'}}, url:{scheme: 'https', port: "443", domain: 'localhost'}}
    parser.apply(record)
    expect(record).toHaveProperty('http.request.method', 'GET')
    expect(record).toHaveProperty('http.version', '1.1')
    expect(record).toHaveProperty('url.original', '/WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script>')
    expect(record).toHaveProperty('url.path', '/WebID/IISWebAgentIF.dll')
    expect(record).not.toHaveProperty('url.path_param')
    expect(record).toHaveProperty('url.query', 'postdata=\\%22%3E%3Cscript%3Efoo%3C/script%3E')
});