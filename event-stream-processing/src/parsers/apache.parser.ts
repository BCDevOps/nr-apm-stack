import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import moment from 'moment';
import {inject} from 'inversify';
import {TYPES} from '../inversify.types';
import {LoggerService} from '../util/logger.service';
import {OsDocument, FingerprintName} from '../types/os-document';

/* eslint-disable max-len,camelcase,@typescript-eslint/no-unsafe-call */
const regex_v1 = /^(?<labels__format>v1\.0) (?<apache__version>[^ ]+) "(?<url__scheme>[^:]+):\/\/(?<url__domain>[^:]+):(?<url__port>\d+)" "(?<client__ip>[^"]+)" \[(?<apache__access__time>[^\]]+)\] "(?<http__request__line>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__request__bytes>(-?|\d+)) bytes (?<http__response__bytes>(-?|\d+)) bytes "(?<http__request__referrer__original>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)" (?<event__duration>\d+) ms, "(?<tls__version_protocol>[^"]+)" "(?<tls__cypher>[^"]+)"$/;
const regex_apache_standard01 = /^(?<source__ip>[^ ]+) ([^ ]+) (?<user__name>[^ ]+) \[(?<apache__access__time>[^\]]+)\] "(?<http__request__line>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__response__bytes>(-?|\d+)) "(?<http__request__referrer__original>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)" (?<event__duration>(-?|\d+))$/;
const regex_apache_standard02 = /^(?<source__ip>[^ ]+) ([^ ]+) (?<user__name>[^ ]+) \[(?<apache__access__time>[^\]]+)\] "(?<http__request__line>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__response__bytes>(-?|\d+)) "(?<http__request__referrer__original>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)"$/;
/* eslint-enable max-len */

export const APACHE_ACCESS_LOG_EVENT_SIGNATURE = Object.freeze({
  event: {
    kind: 'event',
    category: 'web',
    dataset: 'apache.access',
    ingested: '2021-05-26T18:47:40.314-07:00',
  },
});

/**
 * reference:
 * - https://github.com/elastic/beats/tree/master/filebeat/module/apache/access
 * - https://www.josephkirwin.com/2016/03/12/nodejs_redos_mitigation/
 */
@injectable()
export class ApacheParser implements Parser {
  constructor(
    @inject(TYPES.LoggerService) private logger: LoggerService,
  ) {}

  matches(record: OsDocument): boolean {
    return record.fingerprint.name === FingerprintName.APACHE_ACCESS_LOGS;
  }
  apply(record: OsDocument): void {
    this.logger.debug(`Parsing ${record.data.message}`);
    for (const regex of [regex_v1, regex_apache_standard01, regex_apache_standard02]) {
      const m = record.data.message.match(regex);
      if (m !== null) {
        for (const gropName of Object.keys(m.groups)) {
          const fieldName = gropName.split('__').join('.');
          const value = m.groups[gropName];
          if (value !== '-') { // dash is usually a special value that indicates empty/missing
            lodash.set(record.data, fieldName, value);
          }
        }
        break;
      }
    }
  }
}
