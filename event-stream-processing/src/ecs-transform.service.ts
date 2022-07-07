/* eslint-disable @typescript-eslint/no-unsafe-call */
import {KinesisStreamEvent} from 'aws-lambda';
import {injectable, inject, multiInject} from 'inversify';
import {Parser} from './types/parser';
import {TYPES} from './inversify.types';
import {LoggerService} from './util/logger.service';
import {GenericError} from './util/generic.error';
// eslint-disable-next-line max-len
import {KinesisStreamRecordProcessingFailure, OsDocument, OsDocumentProcessingFailure, PipelineObject, PipelineTuple} from './types/os-document';
import {KinesisStreamRecordMapperService} from './shared/kinesis-stream-record-mapper.service';
import {ParserError} from './util/parser.error';
import {partitionToTuple} from './util/pipelineTuple.util';

@injectable()
/**
 * Transform incoming data
 */
export class EcsTransformService {
  /**
   * Constructor
   * @param parsers
   * @param logger
   */
  constructor(
    @multiInject(TYPES.PreInitParser) private preInitParsers: Parser[],
    @multiInject(TYPES.InitParser) private initParsers: Parser[],
    @multiInject(TYPES.PreParser) private preParsers: Parser[],
    @multiInject(TYPES.Parser) private parsers: Parser[],
    @multiInject(TYPES.PostParser) private postParsers: Parser[],
    @multiInject(TYPES.FinalizeParser) private finalizeParsers: Parser[],
    @inject(TYPES.KinesisStreamRecordMapperService) private ksrMapper: KinesisStreamRecordMapperService,
    @inject(TYPES.LoggerService) private logger: LoggerService,
  ) {}

  /**
   * Transform
   * @param event
   * @returns
   */
  public transform(event: KinesisStreamEvent): PipelineTuple {
    if (event.Records) {
      this.logger.log(`Received ${event.Records.length} records`);
      return this.process(this.transformDecode(event));
    }

    return {documents: [], failures: []};
  }

  private transformDecode(event: KinesisStreamEvent): PipelineTuple {
    return event.Records
      .map((record) => {
        try {
          return this.ksrMapper.toOpensearchDocument(record);
        } catch (e: unknown) {
          return new KinesisStreamRecordProcessingFailure(
            record,
            'DECODE_ERROR',
          );
        }
      })
      .reduce(partitionToTuple, {documents: [], failures: []});
  }

  private process(tuple: PipelineTuple): PipelineTuple {
    return tuple.documents.map((document) => {
      if (document instanceof KinesisStreamRecordProcessingFailure) {
        return document;
      }
      try {
        return this.parseDocumentData(document);
      } catch (error: unknown) {
        const parser: string = error instanceof ParserError ? error.parser : 'unknown';
        const message: string = error instanceof ParserError || error instanceof GenericError ?
          error.message : '';
        const team: string = document.data.organization?.id ? document.data.organization.id : 'unknown';
        const hostName: string = document.data.host?.hostname ? document.data.host?.hostname : '';
        const serviceName: string = document.data.service?.name ? document.data.service?.name : '';
        const sequence: string = document.data.event?.sequence ? document.data.event?.sequence : '';
        const path: string = document.data.log?.file?.path ? document.data.log?.file?.path : '';
        // eslint-disable-next-line max-len
        // document.error = `PARSE_ERROR:${parser} ${team} ${hostName} ${serviceName} ${path}:${sequence} ${document.fingerprint.name} : ${message}`;
        // eslint-disable-next-line max-len
        this.logger.log(`PARSE_ERROR:${parser} ${team} ${hostName} ${serviceName} ${path}:${sequence} ${document.fingerprint.name} : ${message}`);
        return new OsDocumentProcessingFailure(
          document,
          // eslint-disable-next-line max-len
          `PARSE_ERROR:${parser} ${team} ${hostName} ${serviceName} ${path}:${sequence} ${document.fingerprint.name} : ${message}`,
        );
      }
    })
      .reduce(partitionToTuple, {documents: [], failures: tuple.failures});
  }

  /**
   *
   * @param record
   * @returns
   */
  private parseDocumentData(document: OsDocument): OsDocument {
    try {
      this.runParsers(document, this.preInitParsers);
      this.ksrMapper.toFingerprintedDocument(document);
      this.runParsers(document, this.initParsers);
      this.runParsers(document, this.preParsers);
      this.runParsers(document, this.parsers);
      this.runParsers(document, this.postParsers);
      this.runParsers(document, this.finalizeParsers);
    } catch (error: any) {
      // this.logger.log(`Error Parsing: ${JSON.stringify(document)}`);
      // this.logger.log(error);
      if (error instanceof ParserError) {
        throw error;
      } else {
        throw new GenericError('Internal', error);
      }
    }
    return document;
  }

  private runParsers(document: OsDocument, parsers: Parser[]) {
    for (const parser of parsers) {
      try {
        if (parser.matches(document)) {
          this.logger.debug(`Processing using: ${parser.constructor.name}`);
          parser.apply(document);
        }
      } catch (error: any) {
        if (error instanceof ParserError) {
          throw error;
        } else {
          throw new ParserError('Unknown data issue', parser.constructor.name, error);
        }
      }
    }
  }
}
