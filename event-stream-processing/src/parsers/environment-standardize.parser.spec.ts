import {OsDocument} from '../types/os-document';
import {EnvironmentStandardizeParser} from './environment-standardize.parser';

describe('EnvironmentStandardizeParser', () => {
  it('matches using metadata', () => {
    const parser = new EnvironmentStandardizeParser();

    expect(parser.matches({data: {'@metadata': {environmentStandardize: true}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('standardizes environment', () => {
    const parser = new EnvironmentStandardizeParser();
    const document = {
      data: {'service': {environment: 'wfint'}, '@metadata': {environmentStandardize: true}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.service).toEqual({
      environment: 'development',
    });
    expect(document.data.labels).toEqual({
      env: 'development',
      env_alias: 'wfint',
    });
  });
});
