import lodash from 'lodash';
import {OsDocumentData} from '../types/os-document';

/**
 * Rename a field
 * @param data The data to modify
 * @param fromName The source field as a dot separated path
 * @param toName The destination field as a dot separated path
 */
export function renameField(data: OsDocumentData, fromName: string, toName: string): void {
  const value = lodash.get(data, fromName);
  if (!lodash.isNil(value)) {
    lodash.set(data, toName, value);
  }
  lodash.unset(data, fromName);
}
