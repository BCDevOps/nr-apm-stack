import {Context, KinesisStreamEvent} from 'aws-lambda';
import {EcsTransformService} from './ecs-transform.service';
import {KinesisStreamService} from './kinesis-stream.service';
import {OpenSearchService} from './open-search.service';
import {LoggerService} from './util/logger.service';

describe('KinesisStreamService', () => {
  it('transforms and then sends data', async () => {
    const docs = ['docs', 'docs', 'docs!'];
    const etService = {
      transform: jest.fn().mockReturnValue(docs),
    } as unknown as EcsTransformService;
    const osService = {
      bulk: jest.fn().mockReturnValue({
        then: jest.fn().mockImplementation((cb) => {
          cb({
            errors: ['err'],
          });
        }),
      }),
    } as unknown as OpenSearchService;
    const logger = {
      log: jest.fn(),
      debug: jest.fn(),
    } as LoggerService;

    const ks = new KinesisStreamService(
      etService,
      osService,
      logger,
    );
    const fakeEvent = {Records: []} as KinesisStreamEvent;
    const fakeContext = {} as Context;

    await ks.handle(fakeEvent, fakeContext);

    expect(etService.transform).toBeCalledTimes(1);
    expect(etService.transform).toBeCalledWith(fakeEvent);

    expect(osService.bulk).toBeCalledTimes(1);
    expect(osService.bulk).toBeCalledWith(docs);
    expect(logger.log).toBeCalledTimes(4);
    expect(logger.log).toBeCalledWith('Transforming 0 kinesis records to ES documents');
    expect(logger.log).toBeCalledWith('Submitting 3 documents to ES');
    expect(logger.log).toBeCalledWith('2 documents added');
    expect(logger.log).toBeCalledWith('1 documents failed');
  });
});
