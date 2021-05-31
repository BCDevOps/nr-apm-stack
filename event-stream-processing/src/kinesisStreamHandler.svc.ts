import { KinesisStreamEvent, Context, KinesisStreamRecord } from "aws-lambda";
import { injectable, inject, multiInject } from "inversify";
import { KinesisStreamHandler } from "./kinesisStreamHandler.isvc";
import {OpenSearch} from './opensearch.isvc'
import {Parser} from './parser.isvc'
import {TYPES} from './inversify.types'
import { Randomizer } from "./randomizer.isvc";
import { Logger } from "./logger.isvc";


@injectable()
export class KinesisStreamHandlerImpl implements KinesisStreamHandler  {
    @inject(TYPES.OpenSearch) private openSearchClient:OpenSearch;

    @multiInject(TYPES.Parser) private parsers : Parser[]

    @inject(TYPES.Randomizer) private randomizer:Randomizer;

    @inject(TYPES.Logger) private logger:Logger;
    
    async convertRecordDataToJson (record: KinesisStreamRecord) {
        return JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('utf8'))
    }
    
    parseMessage (record: any) {
        for (const parser of this.parsers) {
            if (parser.matches(record)){
                parser.apply(record)
            }
        }
        return record
    }

    async transformToElasticCommonSchema (event: KinesisStreamEvent): Promise<any[]> {
        const result: any[] = [];
        if (event.Records){
            // Parallel
            await Promise.all(event.Records.map( kinesisRecord => {
                const _id = Buffer.from(kinesisRecord.kinesis.sequenceNumber + '.' + this.randomizer.randomBytes(16).toString("hex")).toString("hex")
                return this.convertRecordDataToJson(kinesisRecord)
                .then(this.parseMessage.bind(this))
                .then((record)=>{
                    record._id = _id
                    result.push(record)
                }).catch(error=>{
                    result.push({_id, _error:error})
                })
            }))
            //Serial
            /*
            await event.Records.reduce((p, kinesisRecord) => {
                return p.then(() =>{
                    const _id = Buffer.from(kinesisRecord.kinesis.sequenceNumber + '.' + this.randomizer.randomBytes(16).toString("hex")).toString("hex")
                    return this.convertRecordDataToJson(kinesisRecord)
                    .then(this.parseMessage.bind(this))
                    .then(this.geoIp.bind(this))
                    .then(this.parseUserAgent.bind(this))
                    .then((record)=>{
                        record._id = _id
                        result.push(record)
                    }).catch(error=>{
                        result.push({_id, _error:error})
                    })
                })
            }, Promise.resolve()); // initial
            */
        }
        return result
    }

    async handle(event: KinesisStreamEvent, context: Context): Promise<any> {
        const index:Map<string, any> = new Map()
        const docs = await this.transformToElasticCommonSchema(event)
        for (const doc of docs) {
            index.set(doc._id, doc)
        }
        // console.log(JSON.stringify(docs, null, 2))
        return this.openSearchClient.bulk(docs).then(value => {
            if (value.errors === true) {
                const batchItemFailures = []
                let successCount = 0;
                for (const item of value.items) {
                    if (item.create.error) {
                        this.logger.log(item.create)
                        const _idAsString = Buffer.from(item.create._id, 'hex').toString('utf8')
                        const sequenceNumber = _idAsString.substring(0, _idAsString.lastIndexOf('.'))
                        batchItemFailures.push({itemIdentifier: sequenceNumber})
                        this.logger.log(index.get(item.create._id))
                    }else{
                        successCount++
                    }
                }
                this.logger.log(`${successCount} documents added`)
                this.logger.log(`${batchItemFailures.length} documents failed`)
                return Promise.resolve({batchItemFailures})
            }
            this.logger.log(`${docs.length} documents added`)
            return Promise.resolve() as Promise<any>
        })
    }
}
