import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import {inject} from 'inversify';
import {TYPES} from '../inversify.types';
import {LoggerService} from '../util/logger.service';
import {OsDocument, FingerprintCategory} from '../types/os-document';

/* eslint-disable max-len,camelcase,@typescript-eslint/no-unsafe-call */
const regex_v1 = /^(?<labels__format>v1\.0) (?<apache__version>[^ ]+) "(?<url__scheme>[^:]+):\/\/(?<url__domain>[^:]+):(?<url__port>\d+)" "(?<client__ip>[^"]+)" \[(?<apache__access__time>[^\]]+)\] "(?<http__request__line>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__request__bytes>(-?|\d+)) bytes (?<http__response__bytes>(-?|\d+)) bytes "(?<http__request__referrer__original>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)" (?<event__duration>\d+) ms, "(?<tls__version_protocol>[^"]+)" "(?<tls__cypher>[^"]+)"$/;
const regex_apache_standard01 = /^(?<source__ip>[^ ]+) ([^ ]+) (?<user__name>[^ ]+) \[(?<apache__access__time>[^\]]+)\] "(?<http__request__line>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__response__bytes>(-?|\d+)) "(?<http__request__referrer__original>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)" (?<event__duration>(-?|\d+))$/;
const regex_apache_standard02 = /^(?<source__ip>[^ ]+) ([^ ]+) (?<user__name>[^ ]+) \[(?<apache__access__time>[^\]]+)\] "(?<http__request__line>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__response__bytes>(-?|\d+)) "(?<http__request__referrer__original>([^"]|(?<=\\)")*)" "(?<user_agent__original>([^"]|(?<=\\)")*)"$/;
const regex_apache_standard03 = /^(?<source__ip>[^ ]+) - - \[(?<tomcat__access__time>[^\]]+)\] "(?<http__request__line>([^"]|(?<=\\)")*)" (?<http__response__status_code>(-?|\d+)) (?<http__response__bytes>(-?|\d+))$/;
const regex_apache_standard04 = /^(?<tomcat__time>^\d{2}-\w{3}-\d{4}\s\d{2}:\d{2}:\d{2}.\d{3})\s+(?<level>\S+)\s+\[(?<subsystem>\S+)\]\s+(?<class>[\S]+).*$/;
/* eslint-enable max-len */

const underscoreReplaceRegex = /__/g;

/**
 * reference:
 * - https://github.com/elastic/beats/tree/master/filebeat/module/apache/access
 * - https://www.josephkirwin.com/2016/03/12/nodejs_redos_mitigation/
 *
 * Tag: Standard format
 */
@injectable()
/**
 * Parse apache message into fields
 */
export class ApacheParser implements Parser {
  /**
   * Constructor
   * @param logger
   */
  constructor(
    @inject(TYPES.LoggerService) private logger: LoggerService,
  ) {}

  /**
   * Returns true if metadata field apacheAccessLog is true.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].apacheAccessLog);
  }

  /**
   * Parse apache message into fields
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    this.logger.debug(`Parsing ${document.data.message as string}`);
<<<<<<< HEAD
    for (const regex of [regex_v1, regex_apache_standard01, regex_apache_standard02, regex_apache_standard03]) {
=======
    for (
      const regex of [regex_v1, regex_apache_standard01, regex_apache_standard02, regex_apache_standard03,
        regex_apache_standard04]) {
>>>>>>> 0c56851 (feat: Add tomcat logs)
      const m = document.data.message.match(regex);
      if (m !== null) {
        for (const gropName of Object.keys(m.groups)) {
          const value = m.groups[gropName];
          if (value !== '-') { // dash is usually a special value that indicates empty/missing
            const fieldName = gropName.replace(underscoreReplaceRegex, '.');
            lodash.set(document.data, fieldName, value);
          }
        }
        break;
      }
    }
  }
}
