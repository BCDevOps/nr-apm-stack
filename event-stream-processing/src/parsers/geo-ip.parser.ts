
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
  constructor(
    @inject(TYPES.GeoIpService) private geoIp: GeoIpService,
  ) {}

  matches(): boolean {
    return true;
  }
  apply(record: OsDocument): void {
    if (record.data?.client?.ip) {
      Object.assign(record.data.client, this.geoIp.lookup(record.data.client.ip));
    }

    if (record.data?.source?.ip) {
      Object.assign(record.data.source, this.geoIp.lookup(record.data.source.ip));
    } else if (record.data?.source?.address) {
      Object.assign(record.data.source, this.geoIp.lookup(record.data.source.address));
    }
  }
}
