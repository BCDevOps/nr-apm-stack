/* istanbul ignore file */
import {injectable} from 'inversify';
import * as moment from 'moment';
import {DateAndTime} from './date-and-time';

@injectable()
export class DateAndTimeImpl implements DateAndTime {
  now(): moment.Moment {
    return moment();
  }
}
