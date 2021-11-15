/* eslint-disable new-cap */
import {Body, Controller, Post, Query} from '@nestjs/common';
import {AppService} from './app.service';
import {OsDocumentData} from '../types/os-document';
import {OpenSearchBulkResult} from '../open-search.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  handleKinesisEvent(@Body() data: OsDocumentData, @Query('print') print: string): Promise<OpenSearchBulkResult> {
    return this.appService.handleKinesisEvent(data, print === 'true');
  }
}
