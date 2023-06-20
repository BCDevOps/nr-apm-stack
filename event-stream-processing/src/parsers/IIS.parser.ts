import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import {inject} from 'inversify';
import {TYPES} from '../inversify.types';
import {OsDocument} from '../types/os-document';
import {RegexService} from '../shared/regex.service';
import lodash from 'lodash';

/* eslint-disable max-len,camelcase,@typescript-eslint/no-unsafe-call */
const regex_IIS_standard01=/^(?<extract_timestamp>\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s((\S+)\s){2}(?<source__ip>(\S+))\s(?<http__request__method>(\S+))\s(?<url__full>(\S+))\s(\S+)\s(?<url__port>(\S+))\s(-|\S+)\s(?<client__ip>(-|\S+))\s(?<extract_httpVersion>(\S+))\s(?<user_agent__original>(\S+))\s((\S+)\s){2}(?<server__address>(\S+))\s(?<http__response__status_code>(-|\d+))\s((-|\d+)\s){2}(?<http__request__bytes>(-|\d+))\s(?<http__response__bytes>(-|\d+))\s(?<event__duration>(-|\d+)).?$/;

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
 * Parse apache message into fields
 */
export class IISParser implements Parser {
  /**
   * Constructor
   */
  constructor(
    @inject(TYPES.RegexService) private regexService: RegexService,
  ) {}

  /**
   * Returns true if metadata field iisAccessLog is true.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].iisAccessLog);
  }

  /**
   * Parse win iis access message into fields
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    // eslint-disable-next-line max-len
    const extractedFields = this.regexService.applyRegex(document, 'event.original', [regex_IIS_standard01]);
    if (!lodash.isNil(extractedFields.httpVersion) ) {
      const fullVerStr=extractedFields.httpVersion;
      if (fullVerStr.toUpperCase().startsWith('HTTP/')) {
        lodash.set(document.data, 'http.version', fullVerStr.substring('HTTP/'.length));
      }
    }
  }
}
