/* eslint-disable new-cap */
import {Body, Injectable} from '@nestjs/common';
import {myContainer} from '../inversify.config';
import {TYPES} from '../inversify.types';
import {KinesisStreamWrapperService} from '../kinesis-stream-wrapper.service';
import {OpenSearchBulkResult} from '../open-search.service';
import {OsDocumentData} from '../types/os-document';

@Injectable()
export class AppService {
  /**
   * Handles the data received as a mock Kinesis event
   * @param data The data to pass into the parser
   * @param print If true, print the data to the console
   * @returns Promise with the result
   */
  handleKinesisEvent(@Body() data: OsDocumentData, print: boolean): Promise<OpenSearchBulkResult> {
    return myContainer.get<KinesisStreamWrapperService>(TYPES.KinesisStreamWrapperService)
      .handleData(data, print);
  }
}
