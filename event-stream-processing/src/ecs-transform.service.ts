/* eslint-disable @typescript-eslint/no-unsafe-call */
import {KinesisStreamEvent, KinesisStreamRecord} from 'aws-lambda';
import {injectable, inject, multiInject, tagged} from 'inversify';
import {Parser} from './types/parser';
import {TYPES} from './inversify.types';
import {LoggerService} from './util/logger.service';
import {GenericError} from './util/generic.error';
import {STAGE_FINALIZE, STAGE_FINGERPRINT, STAGE_PARSE, TAG_STAGE} from './inversify.config';
import lodash from 'lodash';
import {OsDocument, OsDocumentFingerprint} from './types/os-document';
import {FINGERPRINTS} from './constants/fingerprints';
import {SubsetService} from './shared/subset.service';
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
    @multiInject(TYPES.Parser) @tagged(TAG_STAGE, STAGE_FINGERPRINT) private fingerprintParsers: Parser[],
    @multiInject(TYPES.Parser) @tagged(TAG_STAGE, STAGE_PARSE) private parsers: Parser[],
    @multiInject(TYPES.Parser) @tagged(TAG_STAGE, STAGE_FINALIZE) private finalizeParsers: Parser[],
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
      for (const parser of this.fingerprintParsers) {
        try {
          this.logger.debug(`Processing parse:${parser.constructor.name}`);
          if (parser.matches(document)) {
            parser.apply(document);
          }
        } catch (error: any) {
          throw new GenericError(`Error applying parser ${parser.constructor.name}`, error);
        }
      }
      for (const parser of this.parsers) {
        try {
          this.logger.debug(`Processing parse:${parser.constructor.name}`);
          if (parser.matches(document)) {
            parser.apply(document);
          }
        } catch (error: any) {
          throw new GenericError(`Error applying parser ${parser.constructor.name}`, error);
        }
      }
      for (const parser of this.finalizeParsers) {
        try {
          this.logger.debug(`Processing parse:${parser.constructor.name}`);
          if (parser.matches(document)) {
            parser.apply(document);
          }
        } catch (error: any) {
          throw new GenericError(`Error applying parser ${parser.constructor.name}`, error);
        }
      }
    } catch (error: any) {
      this.logger.log(`Error Parsing:${JSON.stringify(document)}`);
      this.logger.log(error);
      throw new GenericError(`Error processing event`, error);
    }
    return document;
  }
}
