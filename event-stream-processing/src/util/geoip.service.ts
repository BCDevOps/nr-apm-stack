/* eslint-disable @typescript-eslint/no-explicit-any */
export interface GeoIpServiceResult {
  as: any;
  geo: any;
}
export interface GeoIpService {
  lookup(ipAddress: string): GeoIpServiceResult;
}
