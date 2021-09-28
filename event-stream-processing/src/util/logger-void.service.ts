import {injectable} from 'inversify';
import {LoggerService} from './logger.service';

@injectable()
export class LoggerVoidService implements LoggerService {
  debug(): void {
    // Intentionally blank
  }
  log(): void {
    // Intentionally blank
  }
}
