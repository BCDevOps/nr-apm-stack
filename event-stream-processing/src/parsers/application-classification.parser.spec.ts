import {ApplicationClassificationParser} from './application-classification.parser';
import {OsDocument} from '../types/os-document';

describe('ParserApplicationClasification', () => {
  it('app - sitesandtrailsbc.ca', () => {
    const parser = new ApplicationClassificationParser();
    const document = {
      data: {url: {domain: 'www.del.sitesandtrailsbc.ca', path: '/resources/REC2164/siteimages/images.properties.txt'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('labels.application');
    expect(document.data).toHaveProperty('labels.application', 'sitesandtrailsbc');
  });

  it('app - clp-cgi', () => {
    const parser = new ApplicationClassificationParser();
    const document = {
      data: {url: {domain: '142.34.120.12', path: '/clp-cgi/accessDenied.cgi'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('labels.application', 'clp-cgi');
  });
});