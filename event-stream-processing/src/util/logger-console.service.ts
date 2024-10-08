/* istanbul ignore file */
import { injectable } from 'inversify';
import { LoggerService } from './logger.service';
import { isObjectLike } from 'lodash';

@injectable()
export class LoggerConsoleService implements LoggerService {
  debug(_message?: any, ..._optionalParams: any[]): void {
    if (process.env.LOG_LEVEL === 'debug') {
      let __message = _message;
      const ___optionalParams: any[] = [];
      if (isObjectLike(_message)) {
        __message = JSON.stringify(_message);
      }
      if (_optionalParams && _optionalParams.length > 0) {
        for (const optionalParam of _optionalParams) {
          if (isObjectLike(optionalParam)) {
            ___optionalParams.push(JSON.stringify(optionalParam));
          } else {
            ___optionalParams.push(optionalParam);
          }
        }
      }
      console.log(__message, ...___optionalParams);
    }
  }
  log(message?: any, ...optionalParams: any[]): void {
    console.log(message, ...optionalParams);
  }
}
