import { injectable } from "inversify";
import { Logger } from "./logger.isvc";
import {isObjectLike} from 'lodash'

@injectable()
export class LoggerImpl implements Logger  {
    debug(_message?: any, ..._optionalParams: any[]): void {
        if (process.env.LOG_LEVEL === 'debug') {
            let __message = _message
            let ___optionalParams: any[] = []
            if (isObjectLike(_message)) {
                __message=JSON.stringify(_message)
            }
            if (_optionalParams && _optionalParams.length > 0) {
                for (const optionalParam of _optionalParams) {
                    if (isObjectLike(optionalParam)) {
                        ___optionalParams.push(JSON.stringify(optionalParam))
                    }else{
                        ___optionalParams.push(optionalParam)
                    }                    
                }
            }
            console.log(__message, ...___optionalParams)
        }
    }
  }
  log(message?: any, ...optionalParams: any[]): void {
    console.log(message, ...optionalParams);
  }
}
