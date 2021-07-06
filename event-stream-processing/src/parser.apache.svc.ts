import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';
import * as moment from 'moment';
import {inject} from 'inversify';
import {TYPES} from './inversify.types';
import {Logger} from './logger.isvc';

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
export class ParserApacheImpl implements Parser {
    @inject(TYPES.Logger) private logger:Logger;
    matches(record: any): boolean {
      // eslint-disable-next-line max-len
      return record.event?.kind === 'event' && record.event?.category === 'web' && record?.event.dataset === 'apache.access' && record.message;
    }
    apply(record: any): void {
      this.logger.debug(`Parsing ${record.message}`);
      for (const regex of [regex_v1, regex_apache_standard01, regex_apache_standard02]) {
        const m = record.message.match(regex);
        if (m !== null) {
          for (const gropName of Object.keys(m.groups)) {
            const fieldName = gropName.split('__').join('.');
            const value = m.groups[gropName];
            if (fieldName === 'apache.access.time') {
              // lodash.set(record, fieldName, value)
              const date = moment(value, 'DD/MMM/YYYY:HH:mm:ss Z');
              if (date.isValid()) {
                record._index = `nrm-logs-access-${date.format('YYYY.MM.DD')}`;
                lodash.set(record, '@timestamp', date.toISOString(true));
                // lodash.set(record, 'apache.access.timestamp2', date.toDate())
              } else {
                throw new Error(`Invalid Date: ${value}`);
              }
            } else {
              if (value !== '-') { // dash is usually a special value that indicates empty/missing
                lodash.set(record, fieldName, value);
              }
            }
          }
          break;
        }
      }
    }
}
