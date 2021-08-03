import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';
import * as crypto from 'crypto';
import * as path from 'path';
import {typedPath} from 'typed-path';

/**
 * Record path. Provided as a reusable shorthand for readability
 */
const p = typedPath<ecs.Record>();

/**
 * @summary Sets the event hash based on a defined pattern.
 *
 * <host.hostname>:<log.file.path>:<log.file.offset>:<message>
 */
@injectable()
export class FingerprintFilter implements Parser {
  matches(record: ecs.Record): boolean {
    return record.event.kind === 'event' &&
      record.event.category === 'web' &&
      record.event.dataset === 'apache.access' &&
      !lodash.isNil(record.message);
  }
  apply(record: ecs.Record): void {
    // Hash/fingerprinting event.
    const hasher = crypto.createHash('sha256');
    hasher.update(record.host?.hostname ?? '');
    hasher.update(':');
    hasher.update(path.basename(record.log?.file?.path ?? ''));
    hasher.update(':');
    hasher.update(`${record.offset ?? (record.log?.file?.offset ?? -1)}`);
    hasher.update(':');
    hasher.update(record.message ?? '');
    lodash.set(record, p.event.hash.$path, hasher.digest('hex'));
  }
}
