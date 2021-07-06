import {injectable} from 'inversify';
import {Logger} from './logger.isvc';

@injectable()
export class LoggerVoidImpl implements Logger {
  debug(): void {
    // Intentionally blank
  }
  log(): void {
    // Intentionally blank
  }
}
