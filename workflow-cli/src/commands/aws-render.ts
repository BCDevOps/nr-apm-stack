import 'reflect-metadata';
import { Args, Command } from '@oclif/core';
import { vsContainer } from '../inversify.config';
import { TYPES } from '../inversify.types';
import AwsRenderService from '../services/aws-render.service';

export default class AwsRender extends Command {
  static description = 'Renders AWS Cloudformation doc';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {};

  static args = {
    file: Args.string({ name: 'file' }),
  };

  public async run(): Promise<void> {
    await this.parse(AwsRender);
    this.log(`AWS Template render - start`);
    vsContainer.get<AwsRenderService>(TYPES.AwsRenderService).render();
    this.log(`AWS Template render - end`);
  }
}
