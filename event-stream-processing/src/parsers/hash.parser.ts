import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import * as crypto from 'crypto';
import {OsDocument} from '../types/os-document';

/**
 * @summary Sets the event hash based on a defined pattern.
 *
 * <host.hostname>:<log.file.path>:<log.file.offset>:<message>
 */
@injectable()
export class HashParser implements Parser {
  matches(document: OsDocument): boolean {
    /**
     * Returns true if metadata has a hash field.
     * @param document The document to match against
     * @returns
     */
    return !!(document.data['@metadata'] && document.data['@metadata'].hash);
  }

  /**
   * Apply hash to document
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const hashPattern: string = lodash.get(document.data, '@metadata.hash');
    const hasher = crypto.createHash('sha256');
    const hashValArr = hashPattern.split(',')
      .map((path) => lodash.get(document.data, path, ''));

    for (const hashVal of hashValArr) {
      hasher.update(hashVal ?? '');
      hasher.update(':');
    }
    lodash.set(document.data, 'event.hash', hasher.digest('hex'));
  }
}
