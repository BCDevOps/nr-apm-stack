import { injectable } from 'inversify';
import { Parser } from './parser.isvc';
import * as lodash from 'lodash';
import { renameField } from './shared/rename-field';

@injectable()
export class NodeCssParser implements Parser {
  matches(record: any): boolean {
    return record.event?.kind === 'event' &&
      // only parse 'http' (access) logs for now.
      // If parsing error and info logs, change to:
      // lodash.includes(record?.event.dataset, 'node.css');
      lodash.includes(record?.event.dataset, 'node.css.http');
  }
  apply(record: any): void {
    // parse logs from Fluent-bit
    if (lodash.get(record, 'agent.type', '') === 'fluentbit') {
      renameField(record, 'log', 'event.original');
      renameField(record, 'contentLength', 'http.response.body.bytes');
      renameField(record, 'hostname', 'host.hostname');
      renameField(record, 'httpVersion', 'http.version');
      record.ip = this.formatSourceIp(record.ip);
      renameField(record, 'ip', 'source.address');
      renameField(record, 'logFileOffset', 'log.file.offset');
      renameField(record, 'logFilePath', 'log.file.path');
      renameField(record, 'method', 'http.request.method');
      renameField(record, 'namespace', 'host.namespace');
      renameField(record, 'path', 'url.original');
      renameField(record, 'responseTime', 'http.response.time');
      renameField(record, 'statusCode', 'http.response.status_code');
      renameField(record, 'timestamp', '@timestamp');
      renameField(record, 'userAgent', 'user_agent.original');
    }
  }

  /**
 * Remove user from incoming ip
 * eg: '::ffff:10.97.6.1' >>> '10.97.6.1'
 * @param {string} value - the original record.ip field
 */
  formatSourceIp(value: string) {
    return value.replace(/ /g, '').split(':').slice(-1).pop();
  }
}
