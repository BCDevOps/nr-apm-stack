
import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import {inject} from 'inversify';
import lodash from 'lodash';
import {TYPES} from '../inversify.types';
import {knownDomains} from '../constants/known-domains';
import * as querystring from 'querystring';
import {OsDocument} from '../types/os-document';
import {RegexService} from '../shared/regex.service';

/* eslint-disable max-len,camelcase,@typescript-eslint/no-unsafe-call */
const knownAppContextRegex_v1 = /^(?<url__context>\/((int)|(ext)|(pub)|(gov)|(datasets)|(appsdata)))((\/((geoserver)|(pls)))?)(\/(?<labels__project>[^\/]*)?)((\/\S*)?)\/(?<service__target__name>[^\/]*)$/;
const knownAppContextRegex_v2 = /^(?<url__context>(\/((geoserver)|(pls)))?)(\/(?<labels__project>[^\/]*)?)((\/[^\/].*)?)\/(?<service__target__name>[^\/]*)$/;
/* eslint-enable max-len */

@injectable()
/**
 * Classify which app data came from.
 *
 * Tag: Annotation
 */
export class ApplicationClassificationParser implements Parser {
  constructor(
    @inject(TYPES.RegexService) private regexService: RegexService,
  ) {}

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

    if (lodash.isNil(lodash.get(document.data, 'service.target.name'))) {
      const extractedFields = this.regexService.applyRegex(document, 'url.path', [knownAppContextRegex_v1,
        knownAppContextRegex_v2]);

      if (lodash.isNil(extractedFields.service__target__name)) {
        if (!lodash.isNil(extractedFields.labels__project)) {
          lodash.set(document.data, 'service.target.name', extractedFields.labels__project.toLowerCase());
        }
      }
    }
    if (urlPath.startsWith('/clp-cgi')) {
      lodash.set(document.data, 'service.target.name', 'clp-cgi');
    }
    // https://www.oracle-and-apex.com/apex-url-format/
    if (lodash.get(document.data, 'service.target.name') === 'apex' ||
    lodash.get(document.data, 'labels.project') === 'apex') {
      const qs = lodash.get(document.data, 'url.query');
      if (qs) {
        const qsmap = querystring.parse(qs);
        if (qsmap.p) {
          lodash.set(document.data, 'service.target.name', 'apex-'+(qsmap.p as string).split(':')[0]);
        }
      }
    }
  }
}
