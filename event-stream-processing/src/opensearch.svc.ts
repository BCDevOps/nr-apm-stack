import {injectable, inject} from 'inversify';
import './geoip.isvc';
import {OpenSearch, OpenSearchBulkResult} from './opensearch.isvc';
import {URL} from 'url';
import {TYPES} from './inversify.types';
import {AwsHttpClient} from './aws-http-client.isvc';
import {Logger} from './logger.isvc';

@injectable()
export class OpenSearchImpl implements OpenSearch {
    @inject(TYPES.AwsHttpClient) private awsHttpClient:AwsHttpClient;
    @inject(TYPES.Logger) private logger:Logger;

    private url: URL = new URL(process.env.ES_URL || 'http://localhost')
    async bulk(documents: any[]): Promise<OpenSearchBulkResult> {
      const index:Map<string, any> = new Map();
      const filterPath = 'took,errors,items.*.error,items.*._id';
      let body = '';
      const parsingErrors: any[] = [];
      for (const doc of documents) {
        // assign document id
        doc._id = `${doc.kinesis.eventID}:${doc.event?.hash || ''}`;
        if (
          doc.event?.kind === 'event' &&
          doc.event?.category === 'web' &&
          doc?.event.dataset === 'apache.access' &&
          doc.event?.hash
        ) {
          doc._id = `${doc.log?.file?.name}:${doc.offset}:${doc.event?.hash}`;
        }
        index.set(doc._id, doc);
        if (!doc._error) {
          const _index = doc._index;
          const _type = doc._type || '_doc';
          const _id = doc._id;
          delete doc._index;
          delete doc._type;
          delete doc._id;
          body += `{"index":{"_index": "${_index}", "_type": "${_type}"`;
          if (_id) {
            body += `, "_id":"${_id}"`;
          }
          body += `}}\n`;
          body += JSON.stringify(doc)+'\n';
        } else {
          parsingErrors.push(doc);
        }
      }
      const query: any = {refresh: 'wait_for'};
      if (filterPath.length > 0) {
        query.filter_path = filterPath;
      }
      this.logger.log(`${index.size} documents being posted to ES`);
      this.logger.log(`${parsingErrors.length} documents with parsing error and not posted to ES`);
      this.logger.debug('ES_REQUEST_BODY:', body);
      this.logger.debug('ES_REQUEST_QUERY:', query);
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
        .then((value:any)=>{
          if (value.statusCode !== 200) {
            this.logger.log(`ES_RESPONSE_STATUS_CODE ${value.statusCode}`);
            return {success: false, errors: documents};
          }
          const body = JSON.parse(value.body);
          const bodyItems:any[] = body.items;
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
              const doc = index.get(meta._id);
              if (doc) {
                doc._error = meta.error;
                this.logger.log('ES_ERROR '+JSON.stringify(doc));
                errors.push(doc);
              } else {
                this.logger.log('ES_ERROR_DOC_NOT_FOUND '+JSON.stringify(item));
              }
            }
          }
          return {success: errors.length === 0, errors: errors};
        });
    }
}
