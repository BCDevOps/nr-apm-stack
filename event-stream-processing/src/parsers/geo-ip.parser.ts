import {inject, injectable} from 'inversify';
import {Parser} from '../types/parser';
import {TYPES} from '../inversify.types';
import {GeoIpService} from '../util/geoip.service';
import {OsDocument} from '../types/os-document';

@injectable()
/**
 * TODO: CONVERT_RUNS_ALWAYS_TO_METADATA
 */
export class GeoIpParser implements Parser {
  /**
   * Constructor
   * @param geoIp The GeoIp service
   */
  constructor(
    @inject(TYPES.GeoIpService) private geoIp: GeoIpService,
  ) {}

  /**
   * Returns true if ???
   * @param document The document to match against
   * @returns
   */
  matches(): boolean {
    return true;
  }

  /**
   *
   * @param record
   */
  apply(document: OsDocument): void {
    if (document.data?.client?.ip) {
      Object.assign(document.data.client, this.geoIp.lookup(document.data.client.ip));
    }

    if (document.data?.source?.ip) {
      Object.assign(document.data.source, this.geoIp.lookup(document.data.source.ip));
    } else if (document.data?.source?.address) {
      Object.assign(document.data.source, this.geoIp.lookup(document.data.source.address));
    }
  }
}
