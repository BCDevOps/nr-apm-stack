export interface MaxmindLookupService<T> {
  lookup(ipAddress:string): T | null;
}
