import {AsnResponse, CityResponse} from 'maxmind';

export interface MaxmindLookup<T> {
    lookup(ipAddress:string): T;
}


export interface MaxmindCityLookup extends MaxmindLookup<CityResponse>{}
export interface MaxmindAsnLookup extends MaxmindLookup<AsnResponse>{}
