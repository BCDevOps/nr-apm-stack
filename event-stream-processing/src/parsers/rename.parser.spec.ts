import {OsDocument} from '../types/os-document';
import {RenameParser} from './rename.parser';

describe('RenameParser', () => {
  it('matches using metadata', () => {
    const parser = new RenameParser();

    expect(parser.matches({data: {'@metadata': {rename: true}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('renames fields', () => {
    const parser = new RenameParser();
    const document = {
      data: {'log': 'one', '@metadata': {rename: 'log:src.log'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.src).toEqual({
      log: 'one',
    });
    expect(document.data.log).toBe(undefined);
  });
});
