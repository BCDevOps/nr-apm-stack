import {ApplicationClassificationParser} from './application-classification.parser';
import {OsDocument} from '../types/os-document';

describe('ParserApplicationClasification', () => {
  it('app - sitesandtrailsbc.ca', () => {
    const parser = new ApplicationClassificationParser();
    const document = {
      data: {url: {domain: 'www.del.sitesandtrailsbc.ca', path: '/resources/REC2164/siteimages/images.properties.txt'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('service.target.name');
    expect(document.data).toHaveProperty('service.target.name', 'sitesandtrailsbc');
  });

  it('test geoserver', () => {
    const parser = new ApplicationClassificationParser();
    const document = {
      data: {url: {domain: '142.34.120.12', path: '/pub/geoserver/ilrr/wms'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('service.target.name', 'wms');
    expect(document.data).toHaveProperty('labels.target_project', 'geoserver');
  });

  it('test apex', () => {
    const parser = new ApplicationClassificationParser();
    const document = {
      data: {url: {domain: '142.34.120.12', path: '/pub/apex/f'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('service.target.name', 'apex');
    expect(document.data).toHaveProperty('labels.target_project', 'apex');
  });

  it('test webade api', () => {
    const parser = new ApplicationClassificationParser();
    const document = {
      data: {url: {domain: '142.34.120.12', path: '/pub/webade-oauth2/v2/check_token'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('service.target.name', 'webade-oauth2');
    expect(document.data).toHaveProperty('labels.target_project', 'webade');
  });

  it('test fmerest', () => {
    const parser = new ApplicationClassificationParser();
    const document = {
      data: {url: {domain: '142.34.120.12', path: '/fmerest/v3/transformations'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('service.target.name', 'fmerest');
    expect(document.data).toHaveProperty('labels.target_project', 'fmerest');
  });

  it('test dispatch api', () => {
    const parser = new ApplicationClassificationParser();
    const document = {
      data: {url: {domain: '142.34.120.12', path: '/pub/dispatch-middleware/spring-remoting/logNoteService'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('service.target.name', 'dispatch-middleware');
    expect(document.data).toHaveProperty('labels.target_project', 'dispatch');
  });
});
