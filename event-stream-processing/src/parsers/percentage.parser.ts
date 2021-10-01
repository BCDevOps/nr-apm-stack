import {injectable} from 'inversify';
import lodash from 'lodash';
import {OsDocument} from '../types/os-document';
import {Parser} from '../types/parser';

@injectable()
/**
 * Parse percentage of fields
 * @deprecated
 */
export class PercentageParser implements Parser {
  /**
   * Returns true if metadata has a percentage field.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].percentage);
  }

  /**
   * Parse percentage of fields separated by a comma.
   * Example: "field.one,field.two"
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const renameArr = (document.data['@metadata'].percentage as string).split(',');
    for (const renameStr of renameArr) {
      const [numerator, denominator, ratio] = renameStr.split(':');
      const numeratorVal = lodash.get(document.data, numerator);
      const denominatorVal = lodash.get(document.data, denominator);

      if (numeratorVal && denominatorVal &&
        !lodash.get(document.data, ratio)) {
        lodash.set(document.data, ratio, numeratorVal / denominatorVal);
      }
    }
  }
}
