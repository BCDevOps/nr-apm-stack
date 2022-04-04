/* eslint-disable @typescript-eslint/no-unsafe-call */
import {Context, KinesisStreamEvent} from 'aws-lambda';
import {injectable, inject} from 'inversify';
import {OpenSearchBulkResult, OpenSearchService} from './open-search.service';
import {TYPES} from './inversify.types';
import {LoggerService} from './util/logger.service';
import {EcsTransformService} from './ecs-transform.service';

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
  public async handle(event: KinesisStreamEvent, context: Context): Promise<OpenSearchBulkResult> {
    this.logger.log(`Transforming ${event.Records.length} kinesis records to ES documents`);
    const docs = this.ecsTransformService.transform(event);
    this.logger.log(`Submitting ${docs.length} documents to ES`);
    return this.openSearch.bulk(docs).then((value) => {
      this.logger.log(`${docs.length - value.errors.length} documents added`);
      this.logger.log(`${value.errors.length} documents failed`);
      return value;
    });
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
