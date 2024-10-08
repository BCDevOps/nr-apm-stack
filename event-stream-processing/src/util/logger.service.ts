export interface LoggerService {
  /**
   * Prints to `stdout` with newline.
   */
  log(message?: any, ...optionalParams: any[]): void;
  debug(message?: any, ...optionalParams: any[]): void;
}
