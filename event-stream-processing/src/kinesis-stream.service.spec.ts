import {Context, KinesisStreamEvent} from 'aws-lambda';
import {BatchSummaryService} from './batch-summary.service';
import {EcsTransformService} from './ecs-transform.service';
import {KinesisStreamService} from './kinesis-stream.service';
import {OpenSearchService} from './open-search.service';
import {OsDocument} from './types/os-document';
import {LoggerService} from './util/logger.service';
import {buildOsDocumentPipeline} from './util/pipeline.util';

describe('KinesisStreamService', () => {
  it('transforms and then sends data', async () => {
    const docs = buildOsDocumentPipeline();
    docs.documents = [
      'one' as unknown as OsDocument,
      'two' as unknown as OsDocument,
      'three' as unknown as OsDocument,
    ];
    const etService = {
      transform: jest.fn().mockReturnValue(docs),
    } as unknown as EcsTransformService;
    const osService = {
      bulk: jest.fn().mockReturnValue({
        then: jest.fn().mockImplementation((cb) => {
          cb({
            documents: [
              'one' as unknown as OsDocument,
              'two' as unknown as OsDocument,
            ],
            failures: ['hi'],
          });
        }),
      }),
    } as unknown as OpenSearchService;
    const batchService = {
      logSummary: jest.fn(),
      logMessages: jest.fn(),
    } as unknown as BatchSummaryService;
    const logger = {
      log: jest.fn(),
      debug: jest.fn(),
    } as LoggerService;

    const ks = new KinesisStreamService(
      etService,
      osService,
      batchService,
      undefined,
      logger,
    );
    const fakeEvent = {Records: []} as KinesisStreamEvent;
    const fakeContext = {} as Context;

    await ks.handle(fakeEvent, fakeContext);

    expect(etService.transform).toHaveBeenCalledTimes(1);
    expect(etService.transform).toHaveBeenCalledWith(fakeEvent);

    expect(osService.bulk).toHaveBeenCalledTimes(1);
    expect(osService.bulk).toHaveBeenCalledWith(docs);
    expect(batchService.logSummary).toHaveBeenCalledTimes(1);
    expect(batchService.logMessages).toHaveBeenCalledTimes(1);
    expect(logger.debug).toHaveBeenCalledTimes(4);
    expect(logger.debug).toHaveBeenCalledWith('Transforming 0 kinesis records to OS documents');
    expect(logger.debug).toHaveBeenCalledWith('Submitting 3 documents to OS');
    expect(logger.debug).toHaveBeenCalledWith('2 documents added');
    expect(logger.debug).toHaveBeenCalledWith('1 documents failed');
  });
});
