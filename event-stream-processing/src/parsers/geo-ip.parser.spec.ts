import {OsDocument} from '../types/os-document';
import {GeoIpService} from '../util/geoip.service';
import {GeoIpParser} from './geo-ip.parser';

describe('GeoIpParser', () => {
  it('matches fields', () => {
    const parser = new GeoIpParser({} as unknown as GeoIpService);

    expect(parser.matches({data: {
      '@metadata': {geoIp: true}, 'client': {ip: 'blah'}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {
      '@metadata': {geoIp: true}, 'source': {ip: 'blah'}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {
      '@metadata': {geoIp: true}, 'source': {address: 'blah'}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {
      '@metadata': {geoIp: false}, 'source': {address: 'blah'}}} as unknown as OsDocument)).toBe(false);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('look up ip string using service', () => {
    const service = {
      lookup: jest.fn().mockReturnValue({test: 'test'}),
    } as unknown as GeoIpService;
    const parser = new GeoIpParser(service as unknown as GeoIpService);
    const document = {
      data: {
        '@metadata': {geoIp: true},
        'client': {ip: 'client_blah'},
        'source': {ip: 'source_blah'},
      },
    } as unknown as OsDocument;
    parser.apply(document);

    expect(service.lookup).toBeCalledTimes(2);
    expect(service.lookup).toBeCalledWith('client_blah');
    expect(service.lookup).toBeCalledWith('source_blah');

    expect(document.data).toEqual({
      '@metadata': {geoIp: true},
      'client': {ip: 'client_blah', test: 'test'},
      'source': {ip: 'source_blah', test: 'test'},
    });
  });

  it('look up address using service', () => {
    const service = {
      lookup: jest.fn().mockReturnValue({test: 'test'}),
    } as unknown as GeoIpService;
    const parser = new GeoIpParser(service as unknown as GeoIpService);
    const document = {
      data: {
        '@metadata': {geoIp: true},
        'source': {address: 'address_blah'},
      },
    } as unknown as OsDocument;
    parser.apply(document);

    expect(service.lookup).toBeCalledTimes(1);
    expect(service.lookup).toBeCalledWith('address_blah');

    expect(document.data).toEqual({
      '@metadata': {geoIp: true},
      'source': {address: 'address_blah', test: 'test'},
    });
  });
});
