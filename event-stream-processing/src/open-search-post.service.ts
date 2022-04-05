import {injectable, inject} from 'inversify';
import {URL} from 'url';
import {TYPES} from './inversify.types';
import {OpenSearchBulkResult, OpenSearchService} from './open-search.service';
import {OsDocument} from './types/os-document';
import {AwsHttpClientService} from './util/aws-http-client.service';
import {LoggerService} from './util/logger.service';

@injectable()
/**
 * Service to post bulk data to OpenSearch
 */
export class OpenSearchPostService implements OpenSearchService {
  private url: URL = new URL(process.env.ES_URL || 'http://localhost');

  constructor(
    @inject(TYPES.AwsHttpClientService) private awsHttpClient: AwsHttpClientService,
    @inject(TYPES.LoggerService) private logger: LoggerService,
  ) {}

  /**
   * Upload a bulk set of documents
   * @param documents The documents to upload
   */
  async bulk(documents: OsDocument[]): Promise<OpenSearchBulkResult> {
    const index = new Map<string, OsDocument>();
    const filterPath = 'took,errors,items.*.error,items.*._id';
    let body = '';
    const parsingErrors: OsDocument[] = [];
    for (const document of documents) {
      if (document.id === null) {
        this.logDocError('ES_ERROR', document, 'Document with no id');
        parsingErrors.push(document);
        continue;
      }
      if (document.index === null) {
        this.logDocError('ES_ERROR', document, 'Document with no index');
        parsingErrors.push(document);
        continue;
      }
      index.set(document.id, document);
      if (!document.error) {
        body += `{"index":{"_index": "${document.index}", "_type": "${document.type}"`;
        if (document.id) {
          body += `, "_id":"${document.id}"`;
        }
        body += `}}\n`;
        body += JSON.stringify(document.data)+'\n';
      } else {
        parsingErrors.push(document);
      }
    }
    const query: {
      refresh: string;
      // eslint-disable-next-line camelcase
      filter_path?: string;
    } = {refresh: 'wait_for'};
    if (filterPath.length > 0) {
      query.filter_path = filterPath;
    }
    this.logger.log(`${index.size} documents being posted to ES`);
    this.logger.log(`${parsingErrors.length} documents with parsing error and not posted to ES`);
    this.logger.debug('ES_REQUEST_BODY:', body);
    this.logger.debug('ES_REQUEST_QUERY:', query);
    if (body.length === 0) {
      return Promise.resolve({success: true, errors: []});
    }
    return await this.awsHttpClient.executeSignedHttpRequest({
      hostname: this.url.hostname,
      protocol: 'https',
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/x-ndjson',
        'host': this.url.hostname,
      },
      query: query,
      path: '/_bulk',
    })
      .then(this.awsHttpClient.waitAndReturnResponseBody.bind(this.awsHttpClient))
      .then((value: any) => {
        if (value.statusCode !== 200) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          this.logger.log(`ES_RESPONSE_STATUS_CODE ${value.statusCode }`);
          return {success: false, errors: documents};
        }
        const body = JSON.parse(value.body);
        const bodyItems: any[] = body.items;
        const errors: any[] = [];
        this.logger.debug('ES_RESPONSE_BODY:', value.body);
        if (parsingErrors.length > 0 ) {
          for (const doc of parsingErrors) {
            errors.push(doc);
          }
        }
        for (const item of bodyItems) {
          const meta = item.create || item.index;
          if (meta.error) {
            const document = index.get(meta._id);
            if (document) {
              document.error = meta.error;
              const message = (typeof meta.error.type === 'string' ? meta.error.type as string : 'Unknown') +
                `: ${typeof meta.error.reason === 'string' ? meta.error.reason as string : 'Unknown'}`;

              this.logDocError('ES_DOCERROR', document, message);
              errors.push(document);
            } else {
              this.logger.log('ES_ERROR_DOC_NOT_FOUND ' + JSON.stringify(item));
            }
          }
        }
        return {success: errors.length === 0, errors: errors};
      });
  }

  private logDocError(type: string, document: OsDocument, message: string) {
    const team: string = document.data.organization?.id ? document.data.organization.id : 'unknown';
    const hostName: string = document.data.host?.hostname ? document.data.host?.hostname as string : '';
    const serviceName: string = document.data.service?.name ? document.data.service?.name : '';
    const sequence: string = document.data.event?.sequence ? document.data.event?.sequence : '';
    const path: string = document.data.log?.file?.path ? document.data.log?.file?.path : '';
    // eslint-disable-next-line max-len
    this.logger.log(`${type} ${team} ${hostName} ${serviceName} ${path}:${sequence} ${document.fingerprint.name} : ${message}`);
    this.logger.debug('ES_ERROR ' + JSON.stringify(document.data));
  }
}
