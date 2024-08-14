import { OsDocument } from '../types/os-document';
import { JoinKvParser } from './join-kv.parser';

describe('IpvParser', () => {
  it('matches metadata field', () => {
    const parser = new JoinKvParser();

    expect(
      parser.matches({
        data: { '@metadata': { joinKv: 'blah' } },
      } as unknown as OsDocument),
    ).toBe(true);
    expect(
      parser.matches({ data: { '@metadata': {} } } as unknown as OsDocument),
    ).toBe(false);
  });

  it('rewrites object keys/values', () => {
    const parser = new JoinKvParser();
    const document = {
      data: {
        source: { ip: '10.97.6.1', dog: 'god' },
        '@metadata': { joinKv: 'source' },
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.source).toEqual('ip=10.97.6.1&dog=god');
  });
});
