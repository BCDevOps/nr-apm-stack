import {injectable} from 'inversify';
import {Parser} from './parser.isvc';
import * as lodash from 'lodash';
import * as path from 'path';
import {format as formatUrl} from 'url';
import {expandFileAttributesFromPath} from './shared/expand-file-attributes-from-path';
/* eslint-disable @typescript-eslint/no-unsafe-call */

function explodeURL(url: URL): any {
  const record: any = {};
  // URL.protocol always ends with ":"
  lodash.set(record, 'scheme', url.protocol.slice(0, -1));
  if (url.port.length>0) {
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
  if (url.username.length>0) {
    lodash.set(record, 'username', url.username);
  }
  if (url.password.length>0) {
    lodash.set(record, 'password', '-');
  }
  const indexOfFirstSemicolonInPath = url.pathname.indexOf(';');
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
  if (indexOfLastDotInFileName >0) {
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

@injectable()
export class ParserEcs implements Parser {
  matches(): boolean {
    return true;
  }
  apply(record: any): void {
    if (!lodash.isNil(lodash.get(record, 'log.file.path'))) {
      lodash.set(record, 'log.file.path', (lodash.get(record, 'log.file.path') as string).replace(/\\/g, '/'));
      expandFileAttributesFromPath(lodash.get(record, 'log.file.path') as string, lodash.get(record, 'log.file'));
    }
    if (!lodash.isNil(lodash.get(record, 'http.request.line'))) {
      const value = lodash.get(record, 'http.request.line');
      const firstSpace = value.indexOf(' ');
      const lastSpace = value.lastIndexOf(' ');
      if (firstSpace > 0 && lastSpace > firstSpace ) {
        const httpVersion = value.substring(lastSpace).trim();
        lodash.set(record, 'http.request.method', value.substring(0, firstSpace));
        if (httpVersion.toUpperCase().startsWith('HTTP/')) {
          lodash.set(record, 'http.version', httpVersion.substring('HTTP/'.length));
        }
        const uriOriginal:string = value.substring(firstSpace, lastSpace).trim();
        lodash.set(record, 'url.original', uriOriginal);
        if (uriOriginal.startsWith('/')) {
          // eslint-disable-next-line max-len
          if (!lodash.isNil(lodash.get(record, 'url.scheme')) && !lodash.isNil(lodash.get(record, 'url.domain')) && !lodash.isNil(lodash.get(record, 'url.port'))) {
            // eslint-disable-next-line max-len
            const url = new URL(`${lodash.get(record, 'url.scheme')}://${lodash.get(record, 'url.domain')}:${lodash.get(record, 'url.port')}${uriOriginal}`);
            lodash.merge(record.url, explodeURL(url));
          } else {
            const url = new URL(`http://localhost:80${uriOriginal}`);
            lodash.merge(record.url, explodeURL(url));
            lodash.unset(record.url, 'scheme');
            lodash.unset(record.url, 'port');
            lodash.unset(record.url, 'domain');
            lodash.unset(record.url, 'full');
          }
        }
      }
    }
    if (lodash.get(record, 'http.request.referrer.original') === '-') {
      delete record.http.request.referrer.original;
    }
    if (!lodash.isNil(lodash.get(record, 'http.request.referrer.original'))) {
      try {
        const url = new URL(lodash.get(record, 'http.request.referrer.original'));
        lodash.merge(record.http.request.referrer, explodeURL(url));
      } catch (error) {
        lodash.set(record, 'http.request.referrer.error', error.toString());
      }
    }
  }
}
