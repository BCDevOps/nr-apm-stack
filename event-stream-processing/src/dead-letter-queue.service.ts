import {inject, injectable} from 'inversify';
import {OsDocumentPipeline} from './types/os-document';
import {FirehoseClient, PutRecordBatchCommand, PutRecordBatchCommandInput} from '@aws-sdk/client-firehose';
import {TYPES} from './inversify.types';
import {LoggerService} from './util/logger.service';

@injectable()
/**
 * Service to persist data unable to be sent to OpenSearch
 */
export class DeadLetterQueueService {
  constructor(
    @inject(TYPES.LoggerService) private logger: LoggerService,
  ) {}
  private enc = new TextEncoder();
  private client = new FirehoseClient({region: process.env.AWS_DEFAULT_REGION || 'ca-central-1'});

  public async send(pipeline: OsDocumentPipeline) {
    if (pipeline.failures.length === 0) {
      return;
    }
    const params: PutRecordBatchCommandInput = {
      DeliveryStreamName: process.env.DLQ_STREAM_NAME,
      Records: pipeline.failures.map((pipelineObject) => {
        return {
          Data: this.enc.encode(JSON.stringify(pipelineObject)),
        };
      }),
    };
    this.logger.log(`DLQ_PUTRECORD_BATCH: ${pipeline.failures.length} records`);
    const command = new PutRecordBatchCommand(params);
    try {
      await this.client.send(command);
    } catch (error) {
      // error handling.
      this.logger.log('DLQ_ERROR: ' + JSON.stringify(error));
    } finally {
      // finally.
    }
  }
}
