
import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import UAParser = require('ua-parser-js');
import * as lodash from 'lodash';

function removeFalsy(obj: any): any {
  if (typeof obj === 'object') {
    const newObj:any = {};
    for (const [k, v] of Object.entries(obj)) {
      if (!lodash.isNil(v) && !lodash.isEmpty(v)) {
        const v2 = removeFalsy(v);
        if (!lodash.isNil(v2) && !lodash.isEmpty(v2)) {
          newObj[k] = removeFalsy(v2);
        }
      }
    }
    return newObj;
  } else {
    return obj;
  }
}

@injectable()
export class ParserUserAgent implements Parser {
  matches(): boolean {
    return true;
  }
  apply(record: any): void {
    if (record?.user_agent?.original?.length > 1 ) {
      const userAgentString: string = record.user_agent.original;
      const parser = new UAParser(userAgentString);
      const ua = parser.getResult();
      const ecsUa = removeFalsy({
        name: ua.browser?.name,
        version: ua.browser?.version,
        os: {
          name: ua.os?.name,
          version: ua.os?.version,
        },
        device: {
          name: ua.device?.model,
          type: ua.device?.type,
          vendor: ua.device?.vendor,
        },
      });
      if (!ecsUa.name) {
        if (/YandexBot\//i.exec(userAgentString)) {
          ecsUa.name = 'YandexBot';
        } else if (/Googlebot\//i.exec(userAgentString)) {
          ecsUa.name = 'Googlebot';
        }
      }
      lodash.merge(record.user_agent, removeFalsy(ecsUa));
      return record;
    }
    return record;
  }
}
