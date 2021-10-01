/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {injectable} from 'inversify';
import {Parser} from '../types/parser';
import lodash from 'lodash';
import * as path from 'path';
import {format as formatUrl, URL} from 'url';
import {OsDocument, FingerprintName} from '../types/os-document';
/* eslint-disable @typescript-eslint/no-unsafe-call */

@injectable()
/**
 * Add exploded url to document
 */
export class HttpUrlParser implements Parser {
  /**
   * Returns true if the document has APACHE_ACCESS_LOGS fingerprint.
   * @param document The document to match against
   * @returns
   */
  matches(document: OsDocument): boolean {
    return document.fingerprint.name === FingerprintName.APACHE_ACCESS_LOGS;
  }

  /**
   * Add exploded url to document
   * @param document The document to modify
   */
  apply(document: OsDocument): void {
    if (!lodash.isNil(lodash.get(document.data, 'http.request.line'))) {
      const value = lodash.get(document.data, 'http.request.line');
      const firstSpace = value.indexOf(' ');
      const lastSpace = value.lastIndexOf(' ');
      if (firstSpace > 0 && lastSpace > firstSpace ) {
        const httpVersion = value.substring(lastSpace).trim();
        lodash.set(document.data, 'http.request.method', value.substring(0, firstSpace));
        if (httpVersion.toUpperCase().startsWith('HTTP/')) {
          lodash.set(document.data, 'http.version', httpVersion.substring('HTTP/'.length));
        }
        const uriOriginal:string = value.substring(firstSpace, lastSpace).trim();
        lodash.set(document.data, 'url.original', uriOriginal);
        if (uriOriginal.startsWith('/')) {
          // eslint-disable-next-line max-len
          if (!lodash.isNil(lodash.get(document.data, 'url.scheme')) && !lodash.isNil(lodash.get(document.data, 'url.domain')) && !lodash.isNil(lodash.get(document.data, 'url.port'))) {
            // eslint-disable-next-line max-len
            const url = new URL(`${lodash.get(document.data, 'url.scheme')}://${lodash.get(document.data, 'url.domain')}:${lodash.get(document.data, 'url.port')}${uriOriginal}`);
            lodash.merge(document.data.url, this.explodeURL(url));
          } else {
            const url = new URL(`http://localhost:80${uriOriginal}`);
            lodash.merge(document.data.url, this.explodeURL(url));
            lodash.unset(document.data.url, 'scheme');
            lodash.unset(document.data.url, 'port');
            lodash.unset(document.data.url, 'domain');
            lodash.unset(document.data.url, 'full');
          }
        }
      }
    }
    if (lodash.get(document.data, 'http.request.referrer.original') === '-') {
      delete document.data.http.request.referrer.original;
    }
    if (!lodash.isNil(lodash.get(document.data, 'http.request.referrer.original'))) {
      try {
        const url = new URL(lodash.get(document.data, 'http.request.referrer.original'));
        lodash.merge(document.data.http.request.referrer, this.explodeURL(url));
      } catch (error) {
        lodash.set(document.data, 'http.request.referrer.error', error.toString());
      }
    }
  }

  private explodeURL(url: URL): any {
    const record: any = {};
    // URL.protocol always ends with ":"
    lodash.set(record, 'scheme', url.protocol.slice(0, -1));
    if (url.port.length > 0) {
      lodash.set(record, 'port', url.port);
    } else {
      if (url.protocol === 'http:' || url.protocol === 'ws:') {
        lodash.set(record, 'port', '80');
      } else if (url.protocol === 'https:' || url.protocol === 'wss:') {
        lodash.set(record, 'port', '443');
      } else if (url.protocol === 'ftp:') {
        lodash.set(record, 'port', '21');
      }
    }
    if (url.username.length > 0) {
      lodash.set(record, 'username', url.username);
    }
    if (url.password.length > 0) {
      lodash.set(record, 'password', '-');
    }
    const indexOfFirstSemicolonInPath: number = url.pathname.indexOf(';');
    if (indexOfFirstSemicolonInPath > 0) {
      const pathname = url.pathname;
      url.pathname = pathname.substring(0, indexOfFirstSemicolonInPath);
      const pathParam = pathname.substring(indexOfFirstSemicolonInPath + 1 );
      if (pathParam.length > 0) {
        lodash.set(record, 'path_param', pathParam);
      }
    }
    lodash.set(record, 'domain', url.hostname);
    lodash.set(record, 'path', url.pathname);
    const fileName = path.basename(url.pathname);
    if (fileName.length > 0) {
      lodash.set(record, 'file.name', fileName);
    }
    const indexOfLastDotInFileName = fileName.lastIndexOf('.');
    if (indexOfLastDotInFileName > 0) {
      const fileExt = fileName.substring(indexOfLastDotInFileName+1).trim();
      if (fileExt.length>0) {
        lodash.set(record, 'file.ext', fileName.substring(indexOfLastDotInFileName+1));
      }
    }
    if (url.search.length > 1 ) {
      const query: string[] = [];
      const keys = new Set<string>();
      const values = new Set<string>();
      for (const [key, value] of url.searchParams) {
        keys.add(key);
        values.add(value);
        query.push(`${key}=${value}`);
      }
      lodash.set(record, 'query_kv', query);
      lodash.set(record, 'query_k', [...keys]);
      lodash.set(record, 'query_v', [...values]);
      lodash.set(record, 'query', url.search.substring(1));
    }
    if (url.hash.length > 1 ) {
      lodash.set(record, 'fragment', url.hash.substring(1));
    }
    const uri = `//${lodash.get(record, 'domain')}${lodash.get(record, 'path')}`;
    lodash.set(record, 'uri', uri);
    lodash.set(record, 'file.directory', path.dirname(url.pathname));
    lodash.set(record, 'full', formatUrl(url, {auth: false}));
    return record;
  }
}
