import {RegexService} from '../shared/regex.service';
import {OsDocument} from '../types/os-document';
import {IISParser} from './IIS.parser';

describe('IISParser', () => {
  it('matches using metadata', () => {
    const parser = new IISParser({} as unknown as RegexService);

    expect(parser.matches({data: {'@metadata': {iisAccessLog: true}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('calls regexService.applyRegex when apply called', () => {
    const service = {
      applyRegex: jest.fn().mockReturnValue({}),
    } as unknown as RegexService;
    const parser = new IISParser(service);
    const testDoc = {} as unknown as OsDocument;

    parser.apply(testDoc);

    expect(service.applyRegex).toHaveBeenCalledWith(testDoc, 'event.original', expect.any(Array));
    expect(service.applyRegex).toHaveBeenCalledTimes(1);
  });
});
