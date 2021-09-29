import {OsDocument} from '../types/os-document';
import {DocumentIdParser} from './document-id.parser';

describe('DocumentIdParser', () => {
  it('matches metadata field', () => {
    const parser = new DocumentIdParser();

    expect(parser.matches({data: {'@metadata': {docid: 'blah'}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('rewrites ipv4 in ipv6', () => {
    const parser = new DocumentIdParser();
    const document = {
      data: {'event': {'id': 'bob'}, 'hash': '12345', '@metadata': {docid: 'event.id,hash'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.id).toEqual('bob:12345');
  });
});
