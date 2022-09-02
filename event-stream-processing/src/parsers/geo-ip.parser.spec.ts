import {OsDocument} from '../types/os-document';
import {GeoIpService} from '../util/geoip.service';
import {GeoIpParser} from './geo-ip.parser';

describe('GeoIpParser', () => {
  it('matches fields', () => {
    const parser = new GeoIpParser({} as unknown as GeoIpService);

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
      lookup: jest.fn().mockReturnValue({geo: 'test', as: 'blah'}),
    } as unknown as GeoIpService;
    const parser = new GeoIpParser(service as unknown as GeoIpService);
    const document = {
      data: {
        '@metadata': {geoIp: true},
        'source': {ip: 'source_blah'},
      },
    } as unknown as OsDocument;
    parser.apply(document);

    expect(service.lookup).toHaveBeenCalledTimes(1);
    expect(service.lookup).toHaveBeenCalledWith('source_blah');

    expect(document.data).toEqual({
      '@metadata': {geoIp: true},
      'source': {
        as: 'blah',
        geo: 'test',
        ip: 'source_blah',
      },
    });
  });
});
