
import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';
import {knownDomains} from './known-domains';
import * as querystring from 'querystring';

const knownAppContextRegex = /^(?<labels__context>\/((int)|(ext)|(pub)|(gov)|(datasets)|(appsdata))(\/((geoserver)|(pls)))?)\/(?<labels__application>[^\/]*).*$/m;

@injectable()
export class ParserApplicationClasification implements Parser {
  matches(record: any): boolean {
    return !lodash.isNil(lodash.get(record, 'url.domain')) && !lodash.isNil(lodash.get(record, 'url.path'));
  }
  apply(record: any): void {
    const urlDomain:string = lodash.get(record, 'url.domain');
    const urlPath:string = lodash.get(record, 'url.path');

    for (const knownDomain of knownDomains) {
      if (lodash.isString(knownDomain.regex)) {
        knownDomain.regex = new RegExp(knownDomain.regex);
      }
      if ((knownDomain.regex as RegExp).test(urlDomain.toLowerCase())) {
        lodash.set(record, 'labels.application', knownDomain.app);
      }
    }

    if (lodash.isNil(lodash.get(record, 'labels.application'))) {
      const m = knownAppContextRegex.exec(urlPath);
      if (m !== null) {
        for (const gropName of Object.keys(m.groups)) {
          const fieldName = gropName.split('__').join('.');
          const groupValue = m.groups[gropName].toLowerCase();
          lodash.set(record, fieldName, groupValue);
        }
      }
    }
    if (lodash.isNil(lodash.get(record, 'labels.application')) && urlPath.startsWith('/clp-cgi')) {
      lodash.set(record, 'labels.application', 'clp-cgi');
    }
    // https://www.oracle-and-apex.com/apex-url-format/
    if (lodash.get(record, 'labels.application') === 'apex') {
      const qs = lodash.get(record, 'url.query');
      if (qs) {
        const qsmap = querystring.parse(qs);
        if (qsmap.p) {
          lodash.set(record, 'labels.application', 'apex-'+(qsmap.p as string).split(':')[0]);
        }
      }
    }
  }
}
