import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';
import {renameField} from './shared/rename-field';

@injectable()
export class SystemMemoryParser implements Parser {
  matches(record: any): boolean {
    return record.event?.kind === 'metric' && lodash.includes(record?.event.dataset, 'system.memory');
  }
  apply(record: any): void {
    if (lodash.get(record, 'agent.type', '') === 'fluentbit') {
      renameField(record, 'Mem.total', 'system.memory.total');
      renameField(record, 'Mem.used', 'system.memory.used.bytes');
      renameField(record, 'Mem.free', 'system.memory.free');
      renameField(record, 'Swap.total', 'system.memory.swap.total');
      renameField(record, 'Swap.used', 'system.memory.swap.used.bytes');
      renameField(record, 'Swap.free', 'system.memory.swap.free');
    }
    if (record.system?.memory?.used?.bytes && record.system?.memory?.total && !record.system?.memory?.used?.pct) {
      lodash.set(record, 'system.memory.used.pct', record.system?.memory?.used?.bytes / record.system?.memory?.total);
    }
    if (
      record.system?.memory?.swap?.used?.bytes &&
      record.system?.memory?.swap?.total &&
      !record.system?.memory?.swap?.used?.pct
    ) {
      const usedPct = record.system?.memory?.swap?.used?.bytes / record.system?.memory?.swap?.total;
      lodash.set(record, 'system.memory.swap.used.pct', usedPct);
    }
  }
}
