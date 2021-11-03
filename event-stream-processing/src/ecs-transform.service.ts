/* eslint-disable @typescript-eslint/no-unsafe-call */
import {KinesisStreamEvent} from 'aws-lambda';
import {injectable, inject, multiInject} from 'inversify';
import {Parser} from './types/parser';
import {TYPES} from './inversify.types';
import {LoggerService} from './util/logger.service';
import {GenericError} from './util/generic.error';
import {OsDocument} from './types/os-document';
import {KinesisStreamRecordMapperService} from './shared/kinesis-stream-record-mapper.service';

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
  public transform(event: KinesisStreamEvent): OsDocument[] {
    if (event.Records) {
      this.logger.log(`Received ${event.Records.length} records`);
      // TODO: https://www.npmjs.com/package/workerpool

      return event.Records
        .map((record) => this.ksrMapper.toOpensearchDocument(record))
        .map((document) => this.parseDocumentData(document));
    }
    return [];
  }

  /**
   *
   * @param record
   * @returns
   */
  private parseDocumentData(document: OsDocument): OsDocument {
    try {
      this.runParsers(document, this.initParsers);
      this.runParsers(document, this.preParsers);
      this.runParsers(document, this.parsers);
      this.runParsers(document, this.postParsers);
      this.runParsers(document, this.finalizeParsers);
    } catch (error: any) {
      this.logger.log(`Error Parsing:${JSON.stringify(document)}`);
      this.logger.log(error);
      throw new GenericError(`Error processing event`, error);
    }
    return document;
  }

  private runParsers(document: OsDocument, parsers: Parser[]) {
    for (const parser of parsers) {
      try {
        this.logger.debug(`Processing parse:${parser.constructor.name}`);
        if (parser.matches(document)) {
          parser.apply(document);
        }
      } catch (error: any) {
        throw new GenericError(`Error applying parser ${parser.constructor.name}`, error);
      }
    }
  }
}