import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';
import * as moment from 'moment';


@injectable()
export class ParserEcsEventIngested implements Parser {
  matches(_record: any): boolean {
    return true;
  }
  apply(record: any): void {
    lodash.set(record, 'event.ingested', moment().toISOString(true));
  }
}
