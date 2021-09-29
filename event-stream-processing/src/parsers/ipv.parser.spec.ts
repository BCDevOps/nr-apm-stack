import {OsDocument} from '../types/os-document';
import {IpvParser} from './ipv.parser';

describe('IpvParser', () => {
  it('matches metadata field', () => {
    const parser = new IpvParser();

    expect(parser.matches({data: {'@metadata': {ipv: 'blah'}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('rewrites ipv4 in ipv6', () => {
    const parser = new IpvParser();
    const document = {
      data: {'source': {'ip': '::ffff:10.97.6.1'}, '@metadata': {ipv: 'source.ip'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.source).toEqual({'ip': '10.97.6.1'});
  });

  it('does not rewrite non-ipv4 as ipv6', () => {
    const parser = new IpvParser();
    const document = {
      data: {'source': {'ip': '2001::ffff:ffff:ffff:ffff:ffff:ffff'}, '@metadata': {ipv: 'source.ip'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.source).toEqual({'ip': '2001::ffff:ffff:ffff:ffff:ffff:ffff'});
  });
});
