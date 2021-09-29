import {OsDocument} from '../types/os-document';
import {FileAttributeParser} from './file-attribute.parser';

describe('FileAttributeParser', () => {
  it('matches metadata field', () => {
    const parser = new FileAttributeParser();

    expect(parser.matches({data: {'@metadata': {fileAttributes: true}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('remove slash from field', () => {
    const parser = new FileAttributeParser();
    const document = {
      data: {log: {file: {path: '/hi/me/'}}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toEqual({
      log: {file: {
        directory: '/hi',
        path: '/hi/me/',
        name: 'me',
      }},
    });
  });
});
