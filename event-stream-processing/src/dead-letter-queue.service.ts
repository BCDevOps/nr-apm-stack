import {injectable} from 'inversify';
import {OsDocument} from './types/os-document';
import {FirehoseClient, PutRecordBatchCommand, PutRecordBatchCommandInput} from '@aws-sdk/client-firehose';


@injectable()
/**
 * Service to persist data unable to be sent to OpenSearch
 */
export class DeadLetterQueueService {
  private enc = new TextEncoder();
  private client = new FirehoseClient({region: process.env.AWS_DEFAULT_REGION || 'ca-central-1'});

  public async queueData(document: OsDocument, error: string) {
    const recordAsSent = Buffer.from(document.record.kinesis.data, 'base64').toString('utf8');
    const recordAsProcessed = JSON.stringify(document.data);
    // a client can be shared by different commands.

    const params: PutRecordBatchCommandInput = {
      DeliveryStreamName: undefined,
      Records: [
        {
          Data: this.enc.encode(JSON.stringify({
            recordAsSent,
            recordAsProcessed,
            error,
          })),
        },
      ],
    };
    const command = new PutRecordBatchCommand(params);
    // async/await.
    try {
      await this.client.send(command);
      // process data.
    } catch (error) {
      // error handling.
    } finally {
      // finally.
    }
  }
}
