/* eslint-disable new-cap */
import {Body, Controller, Post, Query} from '@nestjs/common';
import {AppService} from './app.service';
import {OsDocumentData} from '../types/os-document';

@Controller()
/**
 * Generic NestJS app controller.
 */
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  /**
   * Handle data received as a mock Kinesis event.
   */
  handleData(@Body() data: OsDocumentData, @Query('print') print: string): Promise<void> {
    return this.appService.handleKinesisEvent(data, print === 'true');
  }
}
