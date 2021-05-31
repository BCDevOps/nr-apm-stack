import { injectable } from "inversify";
import { Logger } from "./logger.isvc";

@injectable()
export class LoggerImpl implements Logger  {
    log(message?: any, ...optionalParams: any[]): void {
        console.log(message, ...optionalParams)
    }
}