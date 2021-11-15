import {injectable, inject, tagged} from 'inversify';
import {TYPES} from './inversify.types';
import {KinesisStreamService} from './kinesis-stream.service';
import {OsDocumentData} from './types/os-document';
import {Context, KinesisStreamEvent, KinesisStreamRecord} from 'aws-lambda';
import {OpenSearchBulkResult} from './open-search.service';
import {LoggerService} from './util/logger.service';

@injectable()
/**
 * Coordinates transforming the data and then bulk uploading it to OpenSearch
 */
export class KinesisStreamWrapperService {
  /**
   * Construct the wrapper service
   * @param kinesisStreamService
   */
  constructor(
    @inject(TYPES.KinesisStreamService) @tagged('localhost', true) private kinesisStreamService: KinesisStreamService,
    @inject(TYPES.LoggerService) private logger: LoggerService,
  ) {}

  /**
   * Handle received data by wrapping in a mock KinesisStreamRecord and forwarding on
   * @param data The data to wrap
   * @returns
   */
  async handleData(data: OsDocumentData, print: boolean): Promise<OpenSearchBulkResult> {
    const event: KinesisStreamEvent = {
      Records: [this.wrapDataIntoRecord(data)],
    };
    // unused so any value will work
    const context: Context = {} as Context;
    const kss = await this.kinesisStreamService.handle(event, context);
    if (print) {
      this.logger.log(JSON.stringify(kss, null, '  '));
    }
    return kss;
  }

  private wrapDataIntoRecord(data: OsDocumentData): KinesisStreamRecord {
    return {
      awsRegion: 'ca-central-1',
      eventID: 'string',
      eventName: 'string',
      eventSource: 'string',
      eventSourceARN: 'string',
      eventVersion: 'string',
      invokeIdentityArn: 'string',
      kinesis: {
        approximateArrivalTimestamp: 0,
        data: Buffer.from(JSON.stringify(data), 'utf8').toString('base64'),
        kinesisSchemaVersion: 'string',
        partitionKey: 'string',
        sequenceNumber: 'string',
      },
    };
  }
}
