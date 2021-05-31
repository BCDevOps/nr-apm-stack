
import { injectable } from "inversify";
import { Parser } from "./parser.isvc";
import UAParser = require("ua-parser-js");


@injectable()
export class ParserUserAgent implements Parser  {
    matches(record: any): boolean {
        return true
    }
    apply(record: any): void {
        if (record?.user_agent?.original?.length > 1 ) {
            const parser = new UAParser(record.user_agent.original)
            record.user_agent = parser.getResult()
            delete record.user_agent.ua
            return record
        }
        return record
    }
}
