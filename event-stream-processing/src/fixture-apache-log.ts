const apacheRequestTime = '05/Jun/2020:19:21:54 -0700';
const apacheInternalIp = '172.30.1.12';
// eslint-disable-next-line max-len
export const APACHE_LOG_COMBINED_FORMAT_1 = '66.183.191.120 - - [05/Jun/2020:07:23:23 -0700] "GET /ext/raad3/map?execution=e1s1&_eventId=agreed HTTP/1.1" 302 - "https://apps.nrs.gov.bc.ca/ext/raad3/map?execution=e1s1" "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0" 24';

export const APACHE_LOG_COMBINED_KEEPALIVE = {
  message: `${apacheInternalIp} - - [${apacheRequestTime}] "GET /keepalive.html HTTP/1.1" 200 9 "-" "-"`,
};
// eslint-disable-next-line max-len
export const APACHE_LOG_V1_FORMAT_BAD_1 = 'v1.0 20120211 "http://a100.gov.bc.ca:80" "222.186.160.235" [28/May/2021:10:43:18 -0700] "GET //data/stat_setting.xml/.php HTTP/1.1" 404 150 bytes 462 bytes "-" "" 11 ms, "-" "-"';

// eslint-disable-next-line max-len
export const APACHE_LOG_V1_APEX_1 = `v1.0 20120211 "http://a100.gov.bc.ca:80" "${apacheInternalIp}" [04/Jun/2021:10:00:51 -0700] "GET /pub/apex/f?p=200:1:1177634512958: HTTP/1.1" 302 251 bytes 520 bytes "-" "-" 17 ms, "-" "-"`;

