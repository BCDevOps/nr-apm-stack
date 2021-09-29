import {OsDocument} from '../types/os-document';
import {DeslashParser} from './deslash.parser';

describe('DeslashParser', () => {
  it('matches metadata field', () => {
    const parser = new DeslashParser();

    expect(parser.matches({data: {'@metadata': {deslash: true}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('remove slash from field', () => {
    const parser = new DeslashParser();
    const document = {
      data: {log: {file: {path: '\\\\hi\\\\me\\'}}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toEqual({
      log: {file: {path: '//hi//me/'}},
    });
  });

  it('fix log file path', () => {
    const parser = new DeslashParser();
    const document = {data: {log: {file: {path: 'C:\\windows\\file\\path'}}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('log.file.path', 'C:/windows/file/path');
  });
});
