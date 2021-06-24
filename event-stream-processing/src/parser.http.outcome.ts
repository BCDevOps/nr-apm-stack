import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';

@injectable()
export class ParserHttpStatusCodeToEventOutCome implements Parser {
  matches(record: any): boolean {
    return !lodash.isNil(lodash.get(record, 'http.response.status_code'));
  }
  apply(record: any): void {
    const statusCode = parseInt(lodash.get(record, 'http.response.status_code'));
    if (statusCode >= 200 && statusCode < 400) {
      lodash.set(record, 'event.outcome', 'success');
    } else if (statusCode == 401 || statusCode == 403) {
      lodash.set(record, 'event.outcome', 'success');
    } else if (statusCode >= 400 && statusCode < 600) {
      lodash.set(record, 'event.outcome', 'failure');
    } else {
      lodash.set(record, 'event.outcome', 'unknown');
    }
  }
}
