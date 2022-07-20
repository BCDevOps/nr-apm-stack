import {DeadLetterQueueService} from './dead-letter-queue.service';
import {KinesisStreamRecordDecodeFailure, OsDocumentPipeline} from './types/os-document';
import {FirehoseClient, PutRecordBatchCommand} from '@aws-sdk/client-firehose';
import {KinesisStreamRecord} from 'aws-lambda';

jest.mock('@aws-sdk/client-firehose');

describe('DeadLetterQueueService', () => {

  beforeAll(() => {
    jest.spyOn(TextEncoder.prototype, 'encode').mockImplementation(() => new Uint8Array());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.mocked(FirehoseClient).mockClear();
    jest.mocked(PutRecordBatchCommand).mockClear();
  })

  it('does not send if no failures', async () => {
    const service = new DeadLetterQueueService();
    const pipeline = new OsDocumentPipeline();

    await service.send(pipeline);

    expect(FirehoseClient).toHaveBeenCalledTimes(1);
    expect(PutRecordBatchCommand).toHaveBeenCalledTimes(0);

    const mockFirehoseClientInstance = jest.mocked(FirehoseClient).mock.instances[0];
    const mockSend = mockFirehoseClientInstance.send;
    expect(mockSend).toHaveBeenCalledTimes(0);
  });

  it('sends failures', async () => {
    const service = new DeadLetterQueueService();
    const pipeline = new OsDocumentPipeline();
    pipeline.failures = [new KinesisStreamRecordDecodeFailure('steam' as unknown as KinesisStreamRecord, 'woo')];

    await service.send(pipeline);

    expect(FirehoseClient).toHaveBeenCalledTimes(1);
    expect(PutRecordBatchCommand).toHaveBeenCalledTimes(1);

    const mockFirehoseClientInstance = jest.mocked(FirehoseClient).mock.instances[0];
    const mockSend = mockFirehoseClientInstance.send;
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(TextEncoder.prototype.encode).toBeCalledTimes(1);
    expect(TextEncoder.prototype.encode).toBeCalledWith('{"source":"steam","message":"woo"}');
  });
});
