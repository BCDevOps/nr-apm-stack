import { injectable } from "inversify";
import { Parser } from "./parser.isvc";
import * as lodash from 'lodash'
import * as crypto from "crypto"
import * as path from "path"

/**
 * If field names contains "." (dot), consider it a path
 */
@injectable()
export class FingerprintFilter implements Parser  {
    matches(record: any): boolean {
        return record.event?.kind === 'event' && record.event?.category === 'web' && record?.event.dataset === 'apache.access' && record.message
    }   
    apply(record: any): void {
                // Hash/fingerprinting event.
                const hasher = crypto.createHash('sha256')
                hasher.update(lodash.get(record, 'host.hostname', ''))
                hasher.update(':')
                hasher.update(path.basename(lodash.get(record, 'log.file.path', '')))
                hasher.update(':')
                hasher.update(`${lodash.get(record, 'offset', -1)}`)
                hasher.update(':')
                hasher.update(lodash.get(record, 'message', ''))
                lodash.set(record, 'event.hash', hasher.digest('hex'))
    }
}
