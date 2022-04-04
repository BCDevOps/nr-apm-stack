/* eslint-disable @typescript-eslint/no-unsafe-call */
import {KinesisStreamEvent} from 'aws-lambda';
import {injectable, inject, multiInject} from 'inversify';
import {Parser} from './types/parser';
import {TYPES} from './inversify.types';
import {LoggerService} from './util/logger.service';
import {GenericError} from './util/generic.error';
import {OsDocument} from './types/os-document';
import {KinesisStreamRecordMapperService} from './shared/kinesis-stream-record-mapper.service';
import {ParserError} from './util/parser.error';

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
  public transform(event: KinesisStreamEvent): OsDocument[] {
    if (event.Records) {
      let badDocs = 0;
      this.logger.log(`Received ${event.Records.length} records`);

      const docs = event.Records
        .map((record) => {
          try {
            return this.ksrMapper.toOpensearchDocument(record);
          } catch (e: unknown) {
            badDocs++;
          }
        })
        .filter((document): document is OsDocument => document !== undefined)
        .map((document) => {
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
            this.logger.log(`PARSE_ERROR:${parser} ${team} ${hostName} ${serviceName} ${path}:${sequence} ${document.fingerprint.name} : ${message}`);
            badDocs++;
            return undefined;
          }
        })
        .filter((document): document is OsDocument => document !== undefined);

      if (badDocs > 0) {
        this.logger.log(`Rejected ${badDocs} records`);
      }
      return docs;
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
