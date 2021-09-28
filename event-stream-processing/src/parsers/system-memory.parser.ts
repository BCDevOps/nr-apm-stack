import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import {renameField} from '../shared/rename-field';
import {OsDocument} from '../types/os-document';

@injectable()
export class SystemMemoryParser implements Parser {
  matches(record: OsDocument): boolean {
    return record.data.event?.kind === 'metric' && lodash.includes(record.data?.event.dataset, 'system.memory');
  }
  apply(record: OsDocument): void {
    if (lodash.get(record.data, 'agent.type', '') === 'fluentbit') {
      renameField(record.data, 'Mem.total', 'system.memory.total');
      renameField(record.data, 'Mem.used', 'system.memory.used.bytes');
      renameField(record.data, 'Mem.free', 'system.memory.free');
      renameField(record.data, 'Swap.total', 'system.memory.swap.total');
      renameField(record.data, 'Swap.used', 'system.memory.swap.used.bytes');
      renameField(record.data, 'Swap.free', 'system.memory.swap.free');
    }
    if (record.data.system?.memory?.used?.bytes && record.data.system?.memory?.total && !record.data.system?.memory?.used?.pct) {
      lodash.set(record.data, 'system.memory.used.pct', record.data.system?.memory?.used?.bytes / record.data.system?.memory?.total);
    }
    if (
      record.data.system?.memory?.swap?.used?.bytes &&
      record.data.system?.memory?.swap?.total &&
      !record.data.system?.memory?.swap?.used?.pct
    ) {
      const usedPct = record.data.system?.memory?.swap?.used?.bytes / record.data.system?.memory?.swap?.total;
      lodash.set(record.data, 'system.memory.swap.used.pct', usedPct);
    }
  }
}
