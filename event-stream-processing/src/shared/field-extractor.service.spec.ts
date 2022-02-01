import {OsDocument} from '../types/os-document';
import {FieldExtractorService} from './field-extractor.service';

describe('FieldExtractorService', () => {
  it('extracts fields', () => {
    const fez = new FieldExtractorService();

    const res = fez.fieldStringToArray('basename(log.path),key', {data: {
      log: {
        path: '/hello/path/me.log',
      },
      key: 'value',
    }} as unknown as OsDocument);
    expect(res).toEqual([
      'me.log',
      'value',
    ]);
  });
});
