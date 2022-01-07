import {injectable} from 'inversify';
import {OsDocument} from '../types/os-document';
import {Parser} from '../types/parser';
import lodash from 'lodash';

const envAlias: {[key: string]: string} = {
  production: 'production',
  test: 'test',
  integration: 'integration',
  development: 'development',
  delivery: 'delivery',
  staging: 'staging',
  staging1: 'staging',
  staging2: 'staging',
  staging3: 'staging',
  wfprd: 'production',
  wftst: 'test',
  wfint: 'integration',
  wfdlv: 'delivery',
};

@injectable()
/**
 * Standardize service environment field
 */
export class EnvironmentStandardizeParser implements Parser {
  /**
   * Returns true if metadata has a environmentStandardize field.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].environmentStandardize);
  }

  /**
   * Standardize service environment field
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const value = lodash.get(document.data, 'service.environment');
    if (value) {
      const lcValue = (value as string).toLowerCase();
      const standardEnv = envAlias[lcValue] ? envAlias[lcValue] : 'unknown';
      lodash.set(document.data, 'labels.env', standardEnv);
      lodash.set(document.data, 'service.environment', standardEnv);
      if (lcValue !== standardEnv) {
        lodash.set(document.data, 'labels.env_alias', lcValue);
      }
    }
  }
}
