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
   *
   * @param data
   * @returns
   */
  handleKinesisEvent(@Body() data: OsDocumentData, print: boolean): Promise<OpenSearchBulkResult> {
    return myContainer.get<KinesisStreamWrapperService>(TYPES.KinesisStreamWrapperService)
      .handleData(data, print);
  }
}
