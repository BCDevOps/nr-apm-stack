import {injectable, inject} from 'inversify';
import {GeoIp} from './geoip.isvc';
import {TYPES} from './inversify.types';
import {MaxmindAsnLookup, MaxmindCityLookup} from './maxmindLookup.isvc';

@injectable()
export class GeoIpImpl implements GeoIp {
    @inject(TYPES.MaxmindCityLookup) private _cityLookup:MaxmindCityLookup;
    @inject(TYPES.MaxmindAsnLookup) private _asnLookup:MaxmindAsnLookup;

    public lookup(ipAddress:string): any {
      const cityLookupResponse = this._cityLookup.lookup(ipAddress);
      const asnLookupResponse = this._asnLookup.lookup(ipAddress);
      const resultGeo: any = {};
      if (cityLookupResponse) {
        if (cityLookupResponse.continent) {
          Object.assign(resultGeo, {
            continent_name: cityLookupResponse.continent?.names?.en,
            continent_code: cityLookupResponse.continent.code,
          });
        }
        if (cityLookupResponse.country) {
          Object.assign(resultGeo, {
            country_name: cityLookupResponse.country?.names?.en,
            country_iso_code: cityLookupResponse.country?.iso_code,
          });
        }
        if (cityLookupResponse.location) {
          Object.assign(resultGeo, {
            location: {lat: cityLookupResponse.location.latitude, lon: cityLookupResponse.location.longitude},
            timezone: cityLookupResponse.location.time_zone,
          });
        }
        if (cityLookupResponse?.postal?.code) {
          resultGeo.postal_code = cityLookupResponse.postal.code;
        }
        if (cityLookupResponse?.city?.names?.en) {
          resultGeo.city_name = cityLookupResponse.city.names.en;
        }
        if (cityLookupResponse?.subdivisions?.length > 0) {
          resultGeo.region_name = cityLookupResponse.subdivisions[0].names.en;
          resultGeo.region_iso_code = cityLookupResponse.subdivisions[0].iso_code;
        }
      }
      const resultAs: any = {};
      if (asnLookupResponse) {
        if (asnLookupResponse.autonomous_system_number) {
          resultAs.number = asnLookupResponse.autonomous_system_number;
        }
        if (asnLookupResponse.autonomous_system_organization) {
          resultAs.organization = {name: asnLookupResponse.autonomous_system_organization};
        }
      }
      return {geo: resultGeo, as: resultAs};
    }
}
