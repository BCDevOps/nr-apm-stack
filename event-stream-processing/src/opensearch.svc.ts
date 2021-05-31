import { injectable, inject } from "inversify";
import './geoip.isvc'
import { OpenSearch, OpenSearchBulkResult } from "./opensearch.isvc";
import {URL} from 'url'
import { TYPES } from "./inversify.types";
import { AwsHttpClient } from "./aws-http-client.isvc";

@injectable()
export class OpenSearchImpl implements OpenSearch  {
    @inject(TYPES.AwsHttpClient) private awsHttpClient:AwsHttpClient;

    private url: URL = new URL(process.env.ES_URL || 'http://localhost')
    async bulk(documents: any[]): Promise<OpenSearchBulkResult> {
        const filter_path = '' //process.env.ES_BULK_FILTER_PATCH || 'took,errors,items.*.error,items.*._id'
        let body = '';
        const parsingErrors: any[] = []
        for (const doc of documents) {
          if (!doc._error) {
            const _index = doc._index
            const _type = doc._type || '_doc'
            const _id = doc._id
            delete doc._index
            delete doc._type
            delete doc._id
            body += `{"create":{"_index": "${_index}", "_type": "${_type}"`
            if (_id){
              body += `, "_id":"${_id}"`
            }
            body += `}}\n`
            body += JSON.stringify(doc)+'\n'
          }else{
            parsingErrors.push(doc)
          }
        }
        const query: any = {refresh: 'wait_for'}
        if (filter_path.length > 0){
          query.filter_path = filter_path
        }
        return await this.awsHttpClient.executeSignedHttpRequest({
            hostname: this.url.hostname,
            protocol: 'https',
            method: "POST",
            body: body,
            headers: {
              "Content-Type": "application/x-ndjson",
              host: this.url.hostname,
            },
            query: query,
            path: "/_bulk",
          })
          .then(this.awsHttpClient.waitAndReturnResponseBody)
          .then((value: any)=>{
            const body = JSON.parse(value.body)
            if (parsingErrors.length > 0 ){
              const items:any[] = body.items
              for (const doc of parsingErrors) {
                items.push({create:{_id: doc._id, error: doc._error}})
              }
              return {errors: true, items}
            }
            return body
          })
    }
}
