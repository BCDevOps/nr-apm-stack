import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import * as crypto from 'crypto';
import * as path from 'path';
import {typedPath} from 'typed-path';
import {Record} from '../types/record';
import {OsDocument} from '../types/os-document';

/**
 * Record path. Provided as a reusable shorthand for readability
 */
const p = typedPath<Record>();

/**
 * @summary Sets the event hash based on a defined pattern.
 *
 * <host.hostname>:<log.file.path>:<log.file.offset>:<message>
 */
@injectable()
export class FingerprintFilterParser implements Parser {
  matches(record: OsDocument): boolean {
    return record.data.event.kind === 'event' &&
      record.data.event.category === 'web' &&
      record.data.event.dataset === 'apache.access' &&
      !lodash.isNil(record.data.message);
  }
  apply(record: OsDocument): void {
    // Hash/fingerprinting event.
    const hasher = crypto.createHash('sha256');
    hasher.update(record.data.host?.hostname ?? '');
    hasher.update(':');
    hasher.update(path.basename(record.data.log?.file?.path ?? ''));
    hasher.update(':');
    hasher.update(`${record.data.offset ?? (record.data.log?.file?.offset ?? -1)}`);
    hasher.update(':');
    hasher.update(record.data.message ?? '');
    lodash.set(record.data, p.event.hash.$path, hasher.digest('hex'));
  }
}
