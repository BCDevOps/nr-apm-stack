import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';
import * as moment from 'moment';

function defaultIndexNamePrefixAndFormat(record: any): {prefix?:string, suffix?: string, format:string} {
  if (record['@metadata']?.index) {
    return {format: record['@metadata'].index};
  } else if (
    record.event?.kind === 'event' &&
    record.event?.category === 'web' &&
    record?.event.dataset === 'apache.access'
  ) {
    return {prefix: 'nrm-logs-access', suffix: '%{+YYYY.MM.DD}', format: '%{prefix}-%{suffix}'};
  } else if (record.event?.kind === 'metric') {
    return {prefix: 'nrm-metrics', suffix: '%{+YYYY.MM.DD}', format: '%{prefix}-%{suffix}'};
  }
  throw new Error('Could not map event to an index');
}

@injectable()
export class IndexNameAssigner implements Parser {
  matches(_record: any): boolean {
    return true;
  }
  apply(record: any): void {
    if (!record._index) {
      const timestamp = lodash.get(record, '@timestamp', lodash.get(record, 'event.created'));

      const indexNaming = defaultIndexNamePrefixAndFormat(record);
      const indexFormat: string = indexNaming.format
        .replace('%{prefix}', indexNaming.prefix)
        .replace('%{suffix}', indexNaming.suffix)
        .replace(/\%\{(?<expression>[^}]+)\}/gm, (match)=>{
          if (match.startsWith('%{+')) {
            if (lodash.isNil(timestamp)) {
              throw new Error('Timestamp field value has not been defined!');
            }
            const date = moment(timestamp);
            return date.format(match.substring(3, match.length - 1));
          }
          throw new Error(`Unexpected formatting: ${match}`);
        });
      record._index = indexFormat;
    }
  }
}
