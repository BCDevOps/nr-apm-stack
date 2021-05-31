import { create as buildContainer, TYPES } from "./inversify.config";
import { Randomizer } from "./randomizer.isvc";
import { MaxmindAsnLookup, MaxmindCityLookup } from "./maxmindLookup.isvc";
import { AsnResponse, CityResponse } from "maxmind";
import { GeoIp } from "./geoip.isvc";

const myContainer = buildContainer()

const geoIpCityLookupVictoria:CityResponse = {
    continent: {code:'NA', geoname_id:0, names: {en:'North America'}},
    country: {iso_code:'CA', geoname_id:0, names:{en:'Canada'}},
    subdivisions:[{geoname_id: 0, iso_code:'BC', names:{en:'British Columbia'}}],
    city: {geoname_id: 1, names:{en: 'Victoria'}},
    location: {latitude:0, longitude:0, accuracy_radius: 0, time_zone: 'America/Vancouver'},
    postal: {code: 'ABC-123'}
}

const geoIpAsnLookupBcGov:AsnResponse = {
    autonomous_system_number: 123456,
    autonomous_system_organization: 'TEST'
}

beforeEach(() => {
    myContainer.snapshot();
    myContainer.rebind<Randomizer>(TYPES.Randomizer).toConstantValue({randomBytes:(size: number)=>{ return Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72])}})
    myContainer.rebind<MaxmindCityLookup>(TYPES.MaxmindCityLookup).toConstantValue({
        lookup: (_ipAddress:string):CityResponse => {
            return geoIpCityLookupVictoria
        }
    })
    myContainer.rebind<MaxmindAsnLookup>(TYPES.MaxmindAsnLookup).toConstantValue({
        lookup: (_ipAddress:string):AsnResponse => {
            return geoIpAsnLookupBcGov
        }
    })
})

afterEach(() => {
    myContainer.restore();
})

test('geoip - geo - full', async () => {
    const geoIp = myContainer.get<GeoIp>(TYPES.GeoIp)
    const response = geoIp.lookup('127.0.0.1')
    expect(response).toHaveProperty('geo.continent_name', geoIpCityLookupVictoria.continent.names.en)
    expect(response).toHaveProperty('geo.continent_code', geoIpCityLookupVictoria.continent.code)
    expect(response).toHaveProperty('geo.country_name', geoIpCityLookupVictoria.country.names.en)
    expect(response).toHaveProperty('geo.country_iso_code', geoIpCityLookupVictoria.country.iso_code)
    expect(response).toHaveProperty('geo.location', {lat:geoIpCityLookupVictoria.location.latitude, lon:geoIpCityLookupVictoria.location.longitude})
    expect(response).toHaveProperty('geo.timezone', geoIpCityLookupVictoria.location.time_zone)
    expect(response).toHaveProperty('geo.postal_code', geoIpCityLookupVictoria.postal.code)
    expect(response).toHaveProperty('geo.city_name', geoIpCityLookupVictoria.city.names.en)
    expect(response).toHaveProperty('geo.region_name', geoIpCityLookupVictoria.subdivisions[0].names.en)
    expect(response).toHaveProperty('geo.region_iso_code', geoIpCityLookupVictoria.subdivisions[0].iso_code)
    expect(response).toHaveProperty('as.number', geoIpAsnLookupBcGov.autonomous_system_number)
    expect(response).toHaveProperty('as.organization.name', geoIpAsnLookupBcGov.autonomous_system_organization)
});

test('geoip - missing postal code', async () => {
    const cityResponse:any = JSON.parse(JSON.stringify(geoIpCityLookupVictoria))
    delete cityResponse.postal.code
    myContainer.rebind<MaxmindCityLookup>(TYPES.MaxmindCityLookup).toConstantValue({
        lookup: (_ipAddress:string):CityResponse => {
            return cityResponse
        }
    })
    const geoIp = myContainer.get<GeoIp>(TYPES.GeoIp)
    const response = geoIp.lookup('127.0.0.1')
    expect(response).toHaveProperty('geo.continent_name', geoIpCityLookupVictoria.continent.names.en)
    expect(response).toHaveProperty('geo.continent_code', geoIpCityLookupVictoria.continent.code)
    expect(response).toHaveProperty('geo.country_name', geoIpCityLookupVictoria.country.names.en)
    expect(response).toHaveProperty('geo.country_iso_code', geoIpCityLookupVictoria.country.iso_code)
    expect(response).toHaveProperty('geo.location', {lat:geoIpCityLookupVictoria.location.latitude, lon:geoIpCityLookupVictoria.location.longitude})
    expect(response).toHaveProperty('geo.timezone', geoIpCityLookupVictoria.location.time_zone)
    expect(response).not.toHaveProperty('geo.postal_code')
    expect(response).toHaveProperty('geo.city_name', geoIpCityLookupVictoria.city.names.en)
    expect(response).toHaveProperty('geo.region_name', geoIpCityLookupVictoria.subdivisions[0].names.en)
    expect(response).toHaveProperty('geo.region_iso_code', geoIpCityLookupVictoria.subdivisions[0].iso_code)
    expect(response).toHaveProperty('as.number', geoIpAsnLookupBcGov.autonomous_system_number)
    expect(response).toHaveProperty('as.organization.name', geoIpAsnLookupBcGov.autonomous_system_organization)
});

test('geoip - missing city name', async () => {
    const cityResponse:any = JSON.parse(JSON.stringify(geoIpCityLookupVictoria))
    delete cityResponse.city.names.en
    myContainer.rebind<MaxmindCityLookup>(TYPES.MaxmindCityLookup).toConstantValue({
        lookup: (_ipAddress:string):CityResponse => {
            return cityResponse
        }
    })
    const geoIp = myContainer.get<GeoIp>(TYPES.GeoIp)
    const response = geoIp.lookup('127.0.0.1')
    expect(response).toHaveProperty('geo.continent_name', geoIpCityLookupVictoria.continent.names.en)
    expect(response).toHaveProperty('geo.continent_code', geoIpCityLookupVictoria.continent.code)
    expect(response).toHaveProperty('geo.country_name', geoIpCityLookupVictoria.country.names.en)
    expect(response).toHaveProperty('geo.country_iso_code', geoIpCityLookupVictoria.country.iso_code)
    expect(response).toHaveProperty('geo.location', {lat:geoIpCityLookupVictoria.location.latitude, lon:geoIpCityLookupVictoria.location.longitude})
    expect(response).toHaveProperty('geo.timezone', geoIpCityLookupVictoria.location.time_zone)
    expect(response).toHaveProperty('geo.postal_code', geoIpCityLookupVictoria.postal.code)
    expect(response).not.toHaveProperty('geo.city_name')
    expect(response).toHaveProperty('geo.region_name', geoIpCityLookupVictoria.subdivisions[0].names.en)
    expect(response).toHaveProperty('geo.region_iso_code', geoIpCityLookupVictoria.subdivisions[0].iso_code)
    expect(response).toHaveProperty('as.number', geoIpAsnLookupBcGov.autonomous_system_number)
    expect(response).toHaveProperty('as.organization.name', geoIpAsnLookupBcGov.autonomous_system_organization)
});

test('geoip - missing province', async () => {
    const cityResponse:any = JSON.parse(JSON.stringify(geoIpCityLookupVictoria))
    delete cityResponse.subdivisions
    myContainer.rebind<MaxmindCityLookup>(TYPES.MaxmindCityLookup).toConstantValue({
        lookup: (_ipAddress:string):CityResponse => {
            return cityResponse
        }
    })
    const geoIp = myContainer.get<GeoIp>(TYPES.GeoIp)
    const response = geoIp.lookup('127.0.0.1')
    expect(response).toHaveProperty('geo.continent_name', geoIpCityLookupVictoria.continent.names.en)
    expect(response).toHaveProperty('geo.continent_code', geoIpCityLookupVictoria.continent.code)
    expect(response).toHaveProperty('geo.country_name', geoIpCityLookupVictoria.country.names.en)
    expect(response).toHaveProperty('geo.country_iso_code', geoIpCityLookupVictoria.country.iso_code)
    expect(response).toHaveProperty('geo.location', {lat:geoIpCityLookupVictoria.location.latitude, lon:geoIpCityLookupVictoria.location.longitude})
    expect(response).toHaveProperty('geo.timezone', geoIpCityLookupVictoria.location.time_zone)
    expect(response).toHaveProperty('geo.postal_code', geoIpCityLookupVictoria.postal.code)
    expect(response).toHaveProperty('geo.city_name', geoIpCityLookupVictoria.city.names.en)
    expect(response).not.toHaveProperty('geo.region_name')
    expect(response).not.toHaveProperty('geo.region_iso_code')
    expect(response).toHaveProperty('as.number', geoIpAsnLookupBcGov.autonomous_system_number)
    expect(response).toHaveProperty('as.organization.name', geoIpAsnLookupBcGov.autonomous_system_organization)
});

test('geoip - missing as', async () => {
    //const asnResponse:any = JSON.parse(JSON.stringify(geoIpCityLookupVictoria))
    //delete asnResponse.subdivisions
    myContainer.rebind<MaxmindAsnLookup>(TYPES.MaxmindAsnLookup).toConstantValue({
        lookup: (_ipAddress:string):AsnResponse => {
            return null
        }
    })
    const geoIp = myContainer.get<GeoIp>(TYPES.GeoIp)
    const response = geoIp.lookup('127.0.0.1')
    expect(response).toHaveProperty('geo.continent_name', geoIpCityLookupVictoria.continent.names.en)
    expect(response).toHaveProperty('geo.continent_code', geoIpCityLookupVictoria.continent.code)
    expect(response).toHaveProperty('geo.country_name', geoIpCityLookupVictoria.country.names.en)
    expect(response).toHaveProperty('geo.country_iso_code', geoIpCityLookupVictoria.country.iso_code)
    expect(response).toHaveProperty('geo.location', {lat:geoIpCityLookupVictoria.location.latitude, lon:geoIpCityLookupVictoria.location.longitude})
    expect(response).toHaveProperty('geo.timezone', geoIpCityLookupVictoria.location.time_zone)
    expect(response).toHaveProperty('geo.postal_code', geoIpCityLookupVictoria.postal.code)
    expect(response).toHaveProperty('geo.city_name', geoIpCityLookupVictoria.city.names.en)
    expect(response).toHaveProperty('geo.region_name', geoIpCityLookupVictoria.subdivisions[0].names.en)
    expect(response).toHaveProperty('geo.region_iso_code', geoIpCityLookupVictoria.subdivisions[0].iso_code)
    expect(response).not.toHaveProperty('as.number')
    expect(response).not.toHaveProperty('as.organization.name')
});
