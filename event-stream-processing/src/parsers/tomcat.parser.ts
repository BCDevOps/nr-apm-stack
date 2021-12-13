import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import {inject} from 'inversify';
import {TYPES} from '../inversify.types';
import {OsDocument} from '../types/os-document';
import {RegexService} from '../shared/regex.service';

/* eslint-disable max-len,camelcase,@typescript-eslint/no-unsafe-call */
const regex_tomcat_localhost_access = /^(?<source__ip>[^ ]+) - - \[(?<tomcat__access__time>[^\]]+)\] "(?<http__request__line>([^"]|(?<=\\)")*)" (?<http__response__status__code>(-?|\d+)) (?<http__response__bytes>(-?|\d+))$/;
/* eslint-enable max-len */

/**
 * reference:
 * - https://github.com/elastic/beats/tree/master/filebeat/module/apache/access
 * - https://www.josephkirwin.com/2016/03/12/nodejs_redos_mitigation/
 *
 * Tag: Standard format
 */
@injectable()
/**
 * Parse tomcat message into fields
 */
export class TomcatParser implements Parser {
  /**
   * Constructor
   * @param regexService
   */
  constructor(
    @inject(TYPES.RegexService) private regexService: RegexService,
  ) {}

  /**
   * Returns true if metadata field tomcatLog is true.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].tomcatLog);
  }

  /**
   * Parse apache message into fields
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    this.regexService.applyRegex(document, 'event.original', [regex_tomcat_localhost_access]);
  }
}
