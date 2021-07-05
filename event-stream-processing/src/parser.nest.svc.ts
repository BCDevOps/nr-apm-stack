import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';

/**
 * If field names contains "." (dot), consider it a path
 */
@injectable()
export class ParserKeyAsPath implements Parser {
  matches(): boolean {
    return true;
  }
  apply(record: any): void {
    for (const key of Object.keys(record)) {
      if (key.indexOf('.')>0) {
        lodash.set(record, key, record[key]);
        delete record[key];
      }
    }
  }
}
