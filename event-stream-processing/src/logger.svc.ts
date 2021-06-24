import {injectable} from 'inversify';
import {Logger} from './logger.isvc';

@injectable()
export class LoggerImpl implements Logger {
  debug(_message?: any, ..._optionalParams: any[]): void {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(_message, ..._optionalParams);
    }
  }
  log(message?: any, ...optionalParams: any[]): void {
    console.log(message, ...optionalParams);
  }
}
