import {FieldExtractorService} from '../shared/field-extractor.service';
import {OsDocument} from '../types/os-document';
import {DocumentIdParser} from './document-id.parser';

describe('DocumentIdParser', () => {
  it('matches metadata field', () => {
    const parser = new DocumentIdParser(new FieldExtractorService());

    expect(parser.matches({data: {'@metadata': {docId: 'blah'}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('calls FieldExtractorService and returns correct value', () => {
    const service = new FieldExtractorService();
    jest.spyOn(service, 'fieldStringToArray');
    const parser = new DocumentIdParser(service);
    const document = {
      data: {'event': {'id': 'bob'}, 'hash': '12345', '@metadata': {docId: 'event.id,hash'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(service.fieldStringToArray).toBeCalledTimes(1);
    expect(service.fieldStringToArray).toBeCalledWith('event.id,hash', document);
    expect(document.id).toEqual('bob:12345');
  });
});
