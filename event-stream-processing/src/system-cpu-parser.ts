import { injectable } from "inversify";
import { Parser } from "./parser.isvc";
import * as lodash from 'lodash'
import { renameField } from "./shared/rename-field";

@injectable()
export class SystemCpuParser implements Parser  {
    matches(record: any): boolean {
        return record.event?.kind === 'metric' && lodash.includes(record?.event.dataset, 'system.cpu')
    }   
    apply(record: any): void {
        if (lodash.get(record, 'agent.type', '') === 'fluentbit') {
            renameField(record, 'user_p', 'system.cpu.user.pct')
            renameField(record, 'system_p', 'system.cpu.system.pct')
            renameField(record, 'cpu_p', 'system.cpu.total.pct')
        }
    }
}
