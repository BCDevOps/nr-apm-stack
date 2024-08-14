import { OsDocument } from './os-document';

/**
 * Make sure to not to use global flag (/.../g) on regular expression patterns!
 */
export interface Parser {
  matches(record: OsDocument): boolean;
  apply(record: OsDocument): void;
}
