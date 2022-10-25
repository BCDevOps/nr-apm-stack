
import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import {knownDomains} from '../constants/known-domains';
import * as querystring from 'querystring';
import {OsDocument} from '../types/os-document';

/* eslint-disable max-len,camelcase,@typescript-eslint/no-unsafe-call */
const knownAppContextRegex_v1 = /^(?<url__context>\/((int)|(ext)|(pub)|(gov)|(datasets)|(appsdata)))\/(?<labels__target_project>geoserver)(\/.\S*)\/((?<service__target__name>[^\/\.]*))((\/[^\/].*)?)$/;
const knownAppContextRegex_v2 = /^(?<url__context>\/((int)|(ext)|(pub)|(gov)|(datasets)|(appsdata)))((\/((geoserver)|(pls)))?)(\/(?<labels__target_project>[^\/-]*)?)((\/\S*)?)$/;
const knownAppContextRegex_v3 = /^(?<url__context>\/((int)|(ext)|(pub)|(gov)|(datasets)|(appsdata)))((\/((geoserver)|(pls)))?)(\/(?<labels__target_project>[^\/]*)?)((\/\S*)?)$/;
const knownAppContextRegex_v4 = /^(?<url__context>(\/((geoserver)|(pls)))?)(\/(?<labels__target_project>[^\/]*)?)((\/\S*)?)$/;
/* eslint-enable max-len */

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
  matches(document: OsDocument): boolean {
    return !!(document.data['@metadata'] && document.data['@metadata'].appClassification);
  }

  /**
   * Classify which app data came from
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    const urlDomain: string = lodash.get(document.data, 'url.domain');
    const urlPath: string = lodash.get(document.data, 'url.path');
    if (lodash.isNil(urlDomain) || lodash.isNil(urlPath)) {
      return;
    }

    for (const knownDomain of knownDomains) {
      if ((knownDomain.regex).test(urlDomain.toLowerCase())) {
        lodash.set(document.data, 'service.target.name', knownDomain.app);
      }
    }

    if (lodash.isNil(lodash.get(document.data, 'service.target.name')) && urlPath.startsWith('/clp-cgi')) {
      lodash.set(document.data, 'service.target.name', 'clp-cgi');
    }
    /* eslint-disable max-len,camelcase,@typescript-eslint/no-unsafe-call */
    if (lodash.isNil(lodash.get(document.data, 'service.target.name'))) {
      for (const regex of [knownAppContextRegex_v1, knownAppContextRegex_v2, knownAppContextRegex_v3, knownAppContextRegex_v4]) {
        const m = regex.exec(urlPath);
        if (m !== null && m.groups) {
          for (const groupName of Object.keys(m.groups)) {
            const fieldName = groupName.replace(/__/g, '.');
            const groupValue = m.groups[groupName].toLowerCase();
            lodash.set(document.data, fieldName, groupValue);
          }
          break;
        }
      }
      if (lodash.isNil(lodash.get(document.data, 'service.target.name'))) {
        if (!lodash.isNil(lodash.get(document.data, 'labels.target_project'))) {
          const fieldValue=lodash.get(document.data, 'labels.target_project');
          lodash.set(document.data, 'service.target.name', fieldValue);
          const firstdash=fieldValue.indexOf('-');
          if (firstdash>0) {
            lodash.set(document.data, 'labels.target_project', fieldValue.substring(0, firstdash));
          }
        }
      }
    }
  }
  /* eslint-enable max-len */
}
