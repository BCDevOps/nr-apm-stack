import {KinesisStreamRecord} from 'aws-lambda';
import {EcsTransformService} from './ecs-transform.service';
import {KinesisStreamRecordMapperService} from './shared/kinesis-stream-record-mapper.service';
import {OsDocument} from './types/os-document';
import {Parser} from './types/parser';
import {LoggerService} from './util/logger.service';
import {ParserError} from './util/parser.error';

describe('EcsTransformService', () => {
  it('transforms data', () => {
    const mockParsers = [
      {
        matches: jest.fn().mockReturnValue(true),
        apply: jest.fn().mockReturnValue({}),
      },
    ] as unknown as Parser[];
    const ksrMapper = {
      toOpensearchDocument: jest.fn().mockReturnValue({}),
      toFingerprintedDocument: jest.fn(),
    } as unknown as KinesisStreamRecordMapperService;
    const logger = {
      log: jest.fn(),
      debug: jest.fn(),
    } as LoggerService;

    const service = new EcsTransformService(
      mockParsers, mockParsers, mockParsers,
      mockParsers, mockParsers, mockParsers,
      ksrMapper, logger);

    service.transform({Records: [{} as KinesisStreamRecord]});

    expect(ksrMapper.toOpensearchDocument).toBeCalledTimes(1);
    expect(ksrMapper.toFingerprintedDocument).toBeCalledTimes(1);
    expect(mockParsers[0].matches).toBeCalledTimes(6);
    expect(mockParsers[0].apply).toBeCalledTimes(6);
    expect(logger.debug).toBeCalledWith('Received 1 records');
  });

  it('rejects and continues processing data', () => {
    const mockParsers = [
      {
        matches: jest.fn().mockReturnValue(true),
        apply: jest.fn()
          .mockImplementationOnce(() => {
            throw new ParserError('hi', 'bob');
          })
          .mockReturnValue({}),
      },
    ] as unknown as Parser[];
    const ksrMapper = {
      toOpensearchDocument: jest.fn().mockReturnValue({
        fingerprint: {
          name: 'fingerprint',
        },
        data: {
          host: {
            hostname: 'host',
          },
          service: {
            name: 'service',
          },
          organization: {
            id: 'org',
          },
          event: {
            sequence: 20,
          },
          log: {
            file: {
              path: '/path',
            },
          },
        },
      } as unknown as OsDocument),
      toFingerprintedDocument: jest.fn(),
    } as unknown as KinesisStreamRecordMapperService;
    const logger = {
      log: jest.fn(),
      debug: jest.fn(),
    } as LoggerService;

    const service = new EcsTransformService(
      mockParsers, mockParsers, mockParsers,
      mockParsers, mockParsers, mockParsers,
      ksrMapper, logger);

    const rVal = service.transform({Records: [{awsRegion: 'fail'} as KinesisStreamRecord, {} as KinesisStreamRecord]});

    expect(ksrMapper.toOpensearchDocument).toBeCalledTimes(2);
    expect(ksrMapper.toFingerprintedDocument).toBeCalledTimes(1);
    expect(mockParsers[0].matches).toBeCalledTimes(7);
    expect(mockParsers[0].apply).toBeCalledTimes(7);
    expect(logger.debug).toBeCalledWith('Received 2 records');
    expect(logger.debug).toBeCalledWith('PARSE_ERROR:bob org host service /path:20 fingerprint : hi');
    expect(rVal.documents.length).toBe(1);
    expect(rVal.documents[0].data.host.hostname).toBe('host');
  });
});
