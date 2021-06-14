/**
 * Make sure to not user global flag (/.../g) on regular expression patterns!
 */
export interface Parser {
    matches(record:any): boolean;
    apply(record: any): void;
}
