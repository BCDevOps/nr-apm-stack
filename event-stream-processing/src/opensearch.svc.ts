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
      const filter_path = 'took,errors,items.*.error,items.*._id';
      let body = '';
      const parsingErrors: any[] = [];
      for (const doc of documents) {
        index.set(doc._id, doc);
        if (!doc._error) {
          const _index = doc._index;
          const _type = doc._type || '_doc';
          const _id = doc._id;
          delete doc._index;
          delete doc._type;
          delete doc._id;
          body += `{"create":{"_index": "${_index}", "_type": "${_type}"`;
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
      if (filter_path.length > 0) {
        query.filter_path = filter_path;
      }
      this.logger.log(`Posting to ES`);
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
        .then((value: any)=>{
          const body = JSON.parse(value.body);
          const bodyItems:any[] = body.items;
          const errors: any[] = [];
          if (parsingErrors.length > 0 ) {
            for (const doc of parsingErrors) {
              errors.push(doc);
            }
          }
          for (const item of bodyItems) {
            if (item.create.error) {
              const doc = index.get(item.create._id);
              if (doc) {
                doc._error = item.create.error;
                this.logger.log('ES_ERROR '+JSON.stringify(doc));
                // const _idAsString = Buffer.from(item.create._id, 'hex').toString('utf8')
                // const sequenceNumber = _idAsString.substring(0, _idAsString.lastIndexOf('.'))
                // batchItemFailures.push({itemIdentifier: sequenceNumber})
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
