import {OsDocument} from '../types/os-document';
import {HashParser} from './hash.parser';

describe('HashParser', () => {
  it('matches metadata field', () => {
    const parser = new HashParser();

    expect(parser.matches({data: {'@metadata': {hash: 'blah'}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('writes hash to event.hash', () => {
    const parser = new HashParser();
    const document = {
      data: {'event': {'id': 'bob'}, 'something': '12345', '@metadata': {hash: 'event.id,something'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.event?.hash).toEqual('b7fed50acc4c491119b529a8321cd7e5a51908ed9749569aafd0f35313335961');
  });
});
