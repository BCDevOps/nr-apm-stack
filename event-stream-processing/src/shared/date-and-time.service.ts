import {injectable} from 'inversify';
import moment from 'moment';

@injectable()
export class DateAndTimeService {
  now(): moment.Moment {
    return moment();
  }
}
