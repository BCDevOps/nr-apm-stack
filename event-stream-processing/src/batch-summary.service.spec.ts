import {KinesisStreamRecord} from 'aws-lambda';
import {BatchSummaryService} from './batch-summary.service';
// eslint-disable-next-line max-len
import {KinesisStreamRecordDecodeFailure, OsDocument, OsDocumentCommitFailure, OsDocumentPipeline, OsDocumentProcessingFailure} from './types/os-document';
import {LoggerService} from './util/logger.service';

describe('BatchSummaryService', () => {
  it('summarize empty pipeline', () => {
    const logger = {
      log: jest.fn(),
      debug: jest.fn(),
    } as LoggerService;

    const bs = new BatchSummaryService(logger);
    const emptyPipeline = new OsDocumentPipeline();

    bs.logSummary(emptyPipeline);
    expect(logger.log).toBeCalledTimes(1);
    // eslint-disable-next-line max-len
    expect(logger.log).toBeCalledWith('{"received":0,"decoded":0,"decode_failed":0,"processed":0,"process_failed":0,"committed":0,"commit_failed":0,"failed":0}');
  });

  it('summarizes pipeline', () => {
    const logger = {
      log: jest.fn(),
      debug: jest.fn(),
    } as LoggerService;

    const bs = new BatchSummaryService(logger);
    const pipeline = new OsDocumentPipeline();

    pipeline.documents = [1, 2] as unknown as OsDocument[];
    pipeline.failures = [
      new KinesisStreamRecordDecodeFailure({} as KinesisStreamRecord, 'msg'),
      new KinesisStreamRecordDecodeFailure({} as KinesisStreamRecord, 'msg'),
      new OsDocumentProcessingFailure({} as OsDocument, 'msg'),
      new OsDocumentCommitFailure({} as OsDocument, 'msg'),
      new OsDocumentCommitFailure({} as OsDocument, 'msg'),
    ];

    bs.logSummary(pipeline);
    expect(logger.log).toBeCalledTimes(1);
    // eslint-disable-next-line max-len
    expect(logger.log).toBeCalledWith('{"received":7,"decoded":5,"decode_failed":2,"processed":4,"process_failed":1,"committed":2,"commit_failed":2,"failed":5}');
  });
});
