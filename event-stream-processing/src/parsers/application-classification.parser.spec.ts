import {ApplicationClassificationParser} from './application-classification.parser';
import {OsDocument} from '../types/os-document';
import {RegexService} from '../shared/regex.service';

describe('ParserApplicationClasification', () => {
  it('app - sitesandtrailsbc.ca', () => {
    const parser = new ApplicationClassificationParser({} as unknown as RegexService);
    const document = {
      data: {url: {domain: 'www.del.sitesandtrailsbc.ca', path: '/resources/REC2164/siteimages/images.properties.txt'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('service.name');
    expect(document.data).toHaveProperty('service.name', 'sitesandtrailsbc');
  });

  it('app - clp-cgi', () => {
    const parser = new ApplicationClassificationParser({} as unknown as RegexService);
    const document = {
      data: {url: {domain: '142.34.120.12', path: '/clp-cgi/accessDenied.cgi'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('service.name', 'clp-cgi');
  });
});
