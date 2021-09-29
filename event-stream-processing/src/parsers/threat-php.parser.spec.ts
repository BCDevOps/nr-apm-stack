import {OsDocument} from '../types/os-document';
import {ThreatPhpParser} from './threat-php.parser';

describe('ThreatPhpParser', () => {
  it('matches anything', () => {
    const parser = new ThreatPhpParser();

    expect(parser.matches({data: {'@metadata': {threatPhp: true}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });
  /**
   * TODO: There should be more tests, but, it is unknown on what basis the scores are being assigned.
   */
});
