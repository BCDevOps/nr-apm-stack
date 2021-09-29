import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import {OsDocument} from '../types/os-document';

@injectable()
/**
 * Parse threat level based on numbers chosen at random.
 */
export class ThreatPhpParser implements Parser {
  /**
   * Returns true if metadata has a threatphp == true.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].threatphp === true);
  }

  /**
   * Parse threat level based on numbers chosen at random.
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const urlOriginal: string = (lodash.get(document.data, 'url.original', '') as string).toLowerCase();
    if (urlOriginal.indexOf('<php') >= 0 || urlOriginal.indexOf('%3Cphp') >= 0) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('/wp-content/') >= 0 ||
      urlOriginal.indexOf('/wp-content/plugins/wp-file-manager') >= 0 ||
      urlOriginal.indexOf('wp-login') >= 0 ) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('phpmyadmin') >=0) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('/_ignition/execute-solution') >= 0) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('xdebug_session_start') >= 0 || urlOriginal.indexOf('phpstorm') >=0) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('phpunit') >= 0 ) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('/solr/admin/info') >= 0 ) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('token=') >= 0 || urlOriginal.indexOf('password=') >=0 ) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 10));
    }
    if (urlOriginal.indexOf('/jsonws/invoke') >= 0 ) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('win.ini') >=0 || urlOriginal.indexOf('system32') >=0 ) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('etc/passwd') >= 0) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('<script>') >= 0 ||
      urlOriginal.indexOf('%3Cscript%3E') >= 0 ||
      urlOriginal.indexOf('<meta') >= 0 ) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('<') >= 0 ||
      urlOriginal.indexOf('>') >= 0 ||
      urlOriginal.indexOf('%3C') >= 0 ||
      urlOriginal.indexOf('%3E') >= 0 ) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (urlOriginal.indexOf('bitrix') >= 0 ) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
    if (!document.data.http?.request?.method) {
      lodash.set(document.data, 'event.risk_score', Math.max(lodash.get(document.data, 'event.risk_score', 0), 1));
    }
  }
}
