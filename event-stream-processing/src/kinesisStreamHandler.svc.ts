import {KinesisStreamEvent, KinesisStreamRecord} from 'aws-lambda';
import {injectable, inject, multiInject} from 'inversify';
import {KinesisStreamHandler} from './kinesisStreamHandler.isvc';
import {OpenSearch} from './opensearch.isvc';
import {Parser} from './parser.isvc';
import {TYPES} from './inversify.types';
import {Randomizer} from './randomizer.isvc';
import {Logger} from './logger.isvc';


@injectable()
export class KinesisStreamHandlerImpl implements KinesisStreamHandler {
    @inject(TYPES.OpenSearch) private openSearchClient:OpenSearch;

    @multiInject(TYPES.Parser) private parsers : Parser[]

    @inject(TYPES.Randomizer) private randomizer:Randomizer;

    @inject(TYPES.Logger) private logger:Logger;

    convertRecordDataToJson(record: KinesisStreamRecord): Promise<any> {
      return Promise.resolve(JSON.parse(Buffer.from(record.kinesis.data, 'base64').toString('utf8')));
    }

    parseMessage(record: any) {
      try {
        for (const parser of this.parsers) {
          this.logger.debug(`Processing parse:${parser.constructor.name}`);
          if (parser.matches(record)) {
            parser.apply(record);
          }
        }
      } catch (error) {
        this.logger.log(`Error Parsing:${JSON.stringify(record)}`);
        this.logger.log(error);
        throw error;
      }
      return record;
    }

    async transformToElasticCommonSchema(event: KinesisStreamEvent): Promise<any[]> {
      const result: any[] = [];
      if (event.Records) {
        this.logger.log(`Received ${event.Records.length} records`);
        // Parallel
        await Promise.all(event.Records.map( (kinesisRecord) => {
          const _id = Buffer.from(
            kinesisRecord.kinesis.sequenceNumber + '.' + this.randomizer.randomBytes(16).toString('hex'),
          ).toString('hex');
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          return this.convertRecordDataToJson(kinesisRecord)
            .then((record: any)=>{
              return Promise.race([
                new Promise<any>((resolve)=>{
                  resolve(this.parseMessage(record));
                }),
                new Promise((resolve, reject) => setTimeout(() => reject(new Error(`Timeout parsinge message`)), 1000)),
              ])
                .then((record)=>{
                  record._id = _id;
                  result.push(record);
                }).catch((error)=>{
                  result.push({_id, _error: error, ...record});
                });
            });
        }));
        // Serial
        /*
            await event.Records.reduce((p, kinesisRecord) => {
                return p.then(() =>{
                    const _id = Buffer.from(
                      kinesisRecord.kinesis.sequenceNumber + '.' + this.randomizer.randomBytes(16).toString("hex")
                      ).toString("hex")
                    return this.convertRecordDataToJson(kinesisRecord)
                    .then(this.parseMessage.bind(this))
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
      return result;
    }

    async handle(event: KinesisStreamEvent): Promise<any> {
      this.logger.log(`Transforming kinesis records to ES documents`);
      const docs = await this.transformToElasticCommonSchema(event);
      this.logger.log(`Submitting ${docs.length} documents to ES`);
      // console.log(JSON.stringify(docs, null, 2))
      return this.openSearchClient.bulk(docs).then((value) => {
        this.logger.log(`${docs.length - value.errors.length} documents added`);
        this.logger.log(`${value.errors.length} documents failed`);
        return Promise.resolve() as Promise<any>;
      });
    }
}
