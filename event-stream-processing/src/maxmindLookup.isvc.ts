import {AsnResponse, CityResponse} from 'maxmind';

export interface MaxmindLookup<T> {
    lookup(ipAddress:string): T;
}


export type MaxmindCityLookup = MaxmindLookup<CityResponse>
export type MaxmindAsnLookup = MaxmindLookup<AsnResponse>
