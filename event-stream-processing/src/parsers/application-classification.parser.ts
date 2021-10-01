
import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import {knownDomains} from '../constants/known-domains';
import * as querystring from 'querystring';
import {OsDocument} from '../types/os-document';

// eslint-disable-next-line max-len
const knownAppContextRegex = /^(?<labels__context>\/((int)|(ext)|(pub)|(gov)|(datasets)|(appsdata))(\/((geoserver)|(pls)))?)\/(?<labels__application>[^\/]*).*$/m;

@injectable()
/**
 * Classify which app data came from.
 *
 * Tag: Annotation
 */
export class ApplicationClassificationParser implements Parser {
  /**
   * Returns true if the document has a url.path and url.domain.
   * @param document The document to match against
   * @returns
   */
  matches(record: OsDocument): boolean {
    return !lodash.isNil(lodash.get(record, 'url.domain')) && !lodash.isNil(lodash.get(record, 'url.path'));
  }

  /**
   * Classify which app data came from
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const urlDomain: string = lodash.get(document.data, 'url.domain');
    const urlPath: string = lodash.get(document.data, 'url.path');

    for (const knownDomain of knownDomains) {
      if ((knownDomain.regex).test(urlDomain.toLowerCase())) {
        lodash.set(document.data, 'labels.application', knownDomain.app);
      }
    }

    if (lodash.isNil(lodash.get(document.data, 'labels.application'))) {
      const m = knownAppContextRegex.exec(urlPath);
      if (m !== null && m.groups) {
        for (const gropName of Object.keys(m.groups)) {
          const fieldName = gropName.split('__').join('.');
          const groupValue = m.groups[gropName].toLowerCase();
          lodash.set(document.data, fieldName, groupValue);
        }
      }
    }
    if (lodash.isNil(lodash.get(document.data, 'labels.application')) && urlPath.startsWith('/clp-cgi')) {
      lodash.set(document.data, 'labels.application', 'clp-cgi');
    }
    // https://www.oracle-and-apex.com/apex-url-format/
    if (lodash.get(document.data, 'labels.application') === 'apex') {
      const qs = lodash.get(document.data, 'url.query');
      if (qs) {
        const qsmap = querystring.parse(qs);
        if (qsmap.p) {
          lodash.set(document.data, 'labels.application', 'apex-'+(qsmap.p as string).split(':')[0]);
        }
      }
    }
  }
}
