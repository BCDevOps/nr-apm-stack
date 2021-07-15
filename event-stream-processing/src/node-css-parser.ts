import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';
import {renameField} from './shared/rename-field';

/**
* This class can parse logs that are received in a JOSN format
* to make them more suited to indexing in a log database
* This class has been used to parse logs from a NodeJS/Express web application
* output with an Express Winston logger (https://www.npmjs.com/package/express-winston)
* and forwarded from the application by Fluent-bit
* @author The Common Services Showcase team <NR.CommonServiceShowcase@gov.bc.ca>
* @author Tim Csaky <tim.csaky@gov.bc.ca>
* @summary A parser for converting application logs into an ECS compatible format
*/
@injectable()
export class NodeCssParser implements Parser {
  /**
   * Checks various properties of the incoming log (eg: event.kind and event.dataset)
   * to determine if it should be parsed by this parser
   * @param {any} record
   */
  matches(record: any): boolean {
    return record.event?.kind === 'event' &&
      // only parse 'http' (access) logs for now.
      // If parsing error and info logs, change to:
      // lodash.includes(record?.event.dataset, 'node.css');
      lodash.includes(record?.event.dataset, 'node.css.http');
  }
  /**
   * Applies formatting changes to the incoming log
   * to make it match the ELastic Common Schema
   * see: https://www.elastic.co/guide/en/ecs/current/ecs-reference.html#_what_is_ecs
   * @param {any} record
   */
  apply(record: any): void {
    // parse logs from Fluent-bit
    if (lodash.get(record, 'agent.type', '') === 'fluentbit') {
      record.clientIp = this.chooseIpvFormat(record.clientIp);
      renameField(record, 'clientIp', 'client.ip');
      renameField(record, 'contentLength', 'http.response.body.bytes');
      renameField(record, 'hostname', 'host.hostname');
      renameField(record, 'httpVersion', 'http.version');
      record.hostIp = this.chooseIpvFormat(record.hostIp);
      renameField(record, 'hostIp', 'host.ip');
      renameField(record, 'log', 'event.original');
      renameField(record, 'logFileOffset', 'log.file.offset');
      renameField(record, 'logFilePath', 'log.file.path');
      renameField(record, 'method', 'http.request.method');
      renameField(record, 'namespace', 'host.namespace');
      renameField(record, 'path', 'url.path');
      record.query = this.showQueryParamsAsString(record.query);
      renameField(record, 'query', 'url.query');
      renameField(record, 'responseTime', 'http.response.time');
      renameField(record, 'statusCode', 'http.response.status_code');
      renameField(record, 'timestamp', '@timestamp');
      renameField(record, 'userAgent', 'user_agent.original');
    }
  }

  /**
 * NodeJS app is outputting the record.hostIp as an IPV6 formatted ip address.
 * eg: '::ffff:10.97.6.1'.  * '::ffff:' is a designated as the IPv4 to IPv6 subnet prefix
 * to show IPv4 addresses in an IPV6 format.
 * see: https://whatismyipaddress.com/work-arounds
 * In an effort to unify ECS ip addresses we can revert to a regular IPV4 address
 * (eg: '10.97.6.1') if it contains this mechanism
 * @param {string} value - the original record.ip field
 */
  chooseIpvFormat(value: string) {
    return value.startsWith('::ffff:') ? value.replace(/ /g, '').split(':').slice(-1).pop() : value;
  }

  /**
   * serialize query paramaters
   * from object properties back to a query string
   */
  showQueryParamsAsString(query: any) {
    const queryString = Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    return queryString;
  }
}
