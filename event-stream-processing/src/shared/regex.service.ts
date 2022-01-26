import lodash from 'lodash';
import {LoggerService} from '../util/logger.service';
import {OsDocument} from '../types/os-document';
import {injectable, inject} from 'inversify';
import {TYPES} from '../inversify.types';

const underscoreReplaceRegex = /__/g;

interface MetaFields {
  [key: string]: string;
}

/**
 * Service for parsing a message field into fields using regex
 */
@injectable()
export class RegexService {
  /**
   * Constructor
   * @param logger
   */
  constructor(
    @inject(TYPES.LoggerService) private logger: LoggerService,
  ) {}

  /**
   * Parse field into fields based on regex
   * @param document The document to modify
   * @param field The field to parse using the regex
   * @param regexArr An array of regex to test for a match
   * @param skipDash Do not add fields where the value is a dash
   */
  applyRegex(document: OsDocument, field: string, regexArr: RegExp[], skipDash = true): MetaFields {
    const metaFields: MetaFields = {};
    const fieldValue = lodash.get(document.data, field);
    this.logger.debug(`Parsing ${fieldValue as string}`);
    for (const regex of regexArr) {
      const m = fieldValue.match(regex);
      if (m !== null) {
        for (const gropName of Object.keys(m.groups)) {
          const value = m.groups[gropName];
          if (skipDash && value === '-') {
            // dash is usually a special value that indicates empty/missing
            continue;
          }
          if (gropName === 'extract_timestamp') {
            document.dataExtractedTimestamp = value;
          } else if (gropName.startsWith('extract_')) {
            metaFields[gropName.substring(8)] = value;
          } else {
            const fieldName = gropName.replace(underscoreReplaceRegex, '.');
            lodash.set(document.data, fieldName, value);
          }
        }
        break;
      }
    }
    return metaFields;
  }
}
