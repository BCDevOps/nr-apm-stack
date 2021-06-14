import { injectable } from "inversify";
import { Logger } from "./logger.isvc";

@injectable()
export class LoggerVoidImpl implements Logger  {
    debug(_message?: any, ..._optionalParams: any[]): void {
    }
    log(message?: any, ...optionalParams: any[]): void {
    }
}