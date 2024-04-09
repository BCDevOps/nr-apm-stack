import 'reflect-metadata';
import { Args, Command, Flags } from '@oclif/core';
import LambdaAssetDownloadService from '../services/lambda-asset-download.service';
import { vsContainer } from '../inversify.config';
import { TYPES } from '../inversify.types';

export default class LambdaAssetDownload extends Command {
  static description = 'Download assets used by the lambda to process data';

  static examples = ['<%= config.bin %> <%= command.id %>'];

  static flags = {
    license: Flags.string({
      char: 'l',
      description: 'MaxMind License',
      env: 'MAXMIND_LICENSE_KEY',
      required: true,
    }),
  };

  static args = {
    file: Args.string({ name: 'file' }),
  };

  public async run(): Promise<void> {
    const { flags } = await this.parse(LambdaAssetDownload);
    this.log(`Lambda asset download - start`);
    await vsContainer
      .get<LambdaAssetDownloadService>(TYPES.LambdaAssetDownloadService)
      .doMaxMindDownload(flags.license);
    this.log(`Lambda asset download - end`);
  }
}
