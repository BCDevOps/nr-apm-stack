import {RegexService} from '../shared/regex.service';
import {OsDocument} from '../types/os-document';
import {TomcatParser} from './tomcat.parser';

describe('TomcatParser', () => {
  it('matches using metadata', () => {
    const parser = new TomcatParser({} as unknown as RegexService);

    expect(parser.matches({data: {'@metadata': {tomcatLog: true}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('calls regexService.applyRegex when apply called', () => {
    const service = {
      applyRegex: jest.fn(),
    } as unknown as RegexService;
    const parser = new TomcatParser(service);
    const testDoc = {} as unknown as OsDocument;

    parser.apply(testDoc);

    expect(service.applyRegex).toBeCalledWith(testDoc, 'event.original', expect.any(Array));
    expect(service.applyRegex).toBeCalledTimes(1);
  });
});
