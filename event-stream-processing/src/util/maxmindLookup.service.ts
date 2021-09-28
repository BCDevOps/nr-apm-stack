import {AsnResponse, CityResponse} from 'maxmind';

export interface MaxmindLookupService<T> {
    lookup(ipAddress:string): T;
}

export type MaxmindCityLookupService = MaxmindLookupService<CityResponse>
export type MaxmindAsnLookupService = MaxmindLookupService<AsnResponse>
