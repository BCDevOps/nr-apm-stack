import { injectable } from "inversify";
import { Parser } from "./parser.isvc";
import * as lodash from 'lodash'
import * as moment from 'moment'

const regex = /^(?<labels__format>v1\.0) (?<apache__version>[^ ]+) "(?<url__scheme>[^:]+):\/\/(?<url__domain>[^:]+):(?<url__port>\d+)" "(?<source__ip>[^"]+)" \[(?<apache__access__time>[^\]]+)\] "(?<http__request__line>(([^"]+)|(?<=\\)")+)" (?<http__response__status_code>\d+) (?<http__request__bytes>\d+) bytes (?<http__response__bytes>\d+) bytes "(?<http__request__referrer__original>(([^"]+)|(?<=\\)")+)" "(?<user_agent__original>(([^"]+)|(?<=\\)")+)" (?<event__duration>\d+) ms, "(?<tls__version_protocol>[^"]+)" "(?<tls__cypher>[^"]+)"$/;

export const APACHE_ACCESS_LOG_EVENT_SIGNATURE = {
    event:{
        kind: 'event',
        category: 'web', 
        dataset: 'apache.access',
        ingested: "2021-05-26T18:47:40.314-07:00",
    }
}

/**
 * reference:
 * - https://github.com/elastic/beats/tree/master/filebeat/module/apache/access
 */
@injectable()
export class ParserApacheImpl implements Parser  {
    matches(record: any): boolean {
        return record.event?.kind === 'event' && record.event?.category === 'web' && record?.event.dataset === 'apache.access'
    }
    apply(record: any): void {
        const m = regex.exec(record.message)
        if (m !== null){
            for (const gropName of Object.keys(m.groups)) {
                const fieldName = gropName.split('__').join('.')
                const value = m.groups[gropName]
                if (fieldName === 'apache.access.time'){
                    //lodash.set(record, fieldName, value)
                    const date = moment(value, 'DD/MMM/YYYY:HH:mm:ss Z')
                    if (date.isValid()) {
                        record._index = `iit-logs-access-${date.format('YYYY.MM.DD')}`
                        lodash.set(record, '@timestamp', date.toISOString(true))
                        //lodash.set(record, 'apache.access.timestamp2', date.toDate())
                    }else{
                        throw new Error(`Invalid Date: ${value}`)
                    }
                }else{
                    lodash.set(record, fieldName, value)
                }
            }
        }
    }
}