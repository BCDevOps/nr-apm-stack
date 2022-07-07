/* eslint-disable @typescript-eslint/no-unsafe-call */
import {Context, KinesisStreamEvent} from 'aws-lambda';
import {injectable, inject} from 'inversify';
import {OpenSearchService} from './open-search.service';
import {TYPES} from './inversify.types';
import {LoggerService} from './util/logger.service';
import {EcsTransformService} from './ecs-transform.service';
import {OsDocumentPipeline} from './types/os-document';

@injectable()
/**
 * Coordinates transforming the data and then bulk uploading it to OpenSearch
 */
export class KinesisStreamService {
  /**
   * Construct the KinesisStreamService
   * @param ecsTransformService
   * @param openSearch
   * @param logger
   */
  constructor(
    @inject(TYPES.EcsTransformService) private ecsTransformService: EcsTransformService,
    @inject(TYPES.OpenSearchService) private openSearch: OpenSearchService,
    @inject(TYPES.LoggerService) private logger: LoggerService,
  ) {}

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * Handle the Kinesis event by transforming and then bulk uploading to OpenSearch
   * @param event The event containing the data to transform
   * @param context The lambda context
   * @returns A promise to wait on
   */
  public async handle(event: KinesisStreamEvent, context: Context): Promise<OsDocumentPipeline> {
    this.logger.log(`Transforming ${event.Records.length} kinesis records to ES documents`);
    const pipeline = this.ecsTransformService.transform(event);
    this.logger.log(`Submitting ${pipeline.documents.length} documents to ES`);
    const sentPipeline = await this.openSearch.bulk(pipeline);
    this.logger.log(`${sentPipeline.documents.length - sentPipeline.failures.length} documents added`);
    this.logger.log(`${sentPipeline.failures.length} documents failed`);
    return sentPipeline;
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
