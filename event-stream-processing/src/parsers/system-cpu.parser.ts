import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import {renameField} from '../shared/rename-field';
import {OsDocument} from '../types/os-document';

@injectable()
export class SystemCpuParser implements Parser {
  matches(record: OsDocument): boolean {
    return record.data.event?.kind === 'metric' && lodash.includes(record.data?.event.dataset, 'system.cpu');
  }
  apply(record: OsDocument): void {
    if (lodash.get(record.data, 'agent.type', '') === 'fluentbit') {
      renameField(record.data, 'user_p', 'system.cpu.user.pct');
      renameField(record.data, 'system_p', 'system.cpu.system.pct');
      renameField(record.data, 'cpu_p', 'system.cpu.total.pct');
    }
  }
}
