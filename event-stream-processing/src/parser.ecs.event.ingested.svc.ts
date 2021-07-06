import {inject, injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';
import {TYPES} from './inversify.types';
import {DateAndTime} from './shared/date-and-time';


@injectable()
export class ParserEcsEventIngested implements Parser {
  @inject(TYPES.DateAndTime) private dateAndTime: DateAndTime;
  matches(): boolean {
    return true;
  }
  apply(record: any): void {
    lodash.set(record, 'event.ingested', this.dateAndTime.now().toISOString(true));
  }
}
