import { ParserApacheImpl, APACHE_ACCESS_LOG_EVENT_SIGNATURE} from "./parser.apache.svc";


test('parse suspicious entry - 001', async () => {
    const parser = new ParserApacheImpl()
    const record = JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: 'v1.0 20120211 "http://142.34.120.18:80" "64.114.237.115" [25/May/2021:15:53:10 -0700] "GET /WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script> HTTP/1.1" 302 347 bytes 1152 bytes "-" "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 5.1; Trident/4.0)" 1 ms, "-" "-"'}))
    parser.apply(record)
    expect(record).toHaveProperty('@timestamp')
    expect(record).toHaveProperty('http.request.line', 'GET /WebID/IISWebAgentIF.dll?postdata=\\"><script>foo</script> HTTP/1.1')
    expect(record).toHaveProperty('event.duration', '1')
});

test('parse suspicious entry - 002', async () => {
    const parser = new ParserApacheImpl()
    const record = JSON.parse(JSON.stringify({...APACHE_ACCESS_LOG_EVENT_SIGNATURE, message: 'v1.0 20120211 "http://142.34.120.21:80" "64.114.237.115" [25/May/2021:15:51:47 -0700] "GET /cgi-bin/count.cgi HTTP/1.1" 302 369 bytes 1043 bytes "-" "() { _; } >_[$($())] { echo Content-Type: text/plain ; echo ; echo \\"bash_cve_2014_6278 Output : $((10+12))\\"; }" 1 ms, "-" "-"'}))
    parser.apply(record)
    expect(record).toHaveProperty('@timestamp')
    expect(record).toHaveProperty('http.request.line', 'GET /cgi-bin/count.cgi HTTP/1.1')
    expect(record).toHaveProperty('http.request.referrer.original', '-')
    expect(record).toHaveProperty('user_agent.original', '() { _; } >_[$($())] { echo Content-Type: text/plain ; echo ; echo \\"bash_cve_2014_6278 Output : $((10+12))\\"; }')
    expect(record).toHaveProperty('event.duration', '1')
});