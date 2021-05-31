
import { inject, injectable } from "inversify";
import { Parser } from "./parser.isvc";
import { TYPES } from "./inversify.types";
import { GeoIp } from "./geoip.isvc";


@injectable()
export class ParserGeoIp implements Parser  {
    @inject(TYPES.GeoIp) private geoIpSvc:GeoIp;
    
    matches(record: any): boolean {
        return true
    }
    apply(record: any): void {
        if (record?.client?.ip) {
            Object.assign(record.client, this.geoIpSvc.lookup(record.client.ip))
            return record
        }
        
        if (record?.source?.ip) {
            Object.assign(record.source, this.geoIpSvc.lookup(record.source.ip))
            return record
        } else if (record?.source?.address) {
            Object.assign(record.source, this.geoIpSvc.lookup(record.source.address))
            return record
        }
    }
}
