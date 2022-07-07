/* eslint-disable @typescript-eslint/no-unsafe-call */
import {Context, KinesisStreamEvent} from 'aws-lambda';
import {injectable, inject} from 'inversify';
import {OpenSearchBulkResult, OpenSearchService} from './open-search.service';
import {TYPES} from './inversify.types';
import {LoggerService} from './util/logger.service';
import {EcsTransformService} from './ecs-transform.service';
import {PipelineTuple} from './types/os-document';

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
  public async handle(event: KinesisStreamEvent, context: Context): Promise<PipelineTuple> {
    this.logger.log(`Transforming ${event.Records.length} kinesis records to ES documents`);
    const tuple = this.ecsTransformService.transform(event);
    this.logger.log(`Submitting ${tuple.documents.length} documents to ES`);
    return this.openSearch.bulk(tuple).then((tuple) => {
      this.logger.log(`${tuple.documents.length - tuple.failures.length} documents added`);
      this.logger.log(`${tuple.failures.length} documents failed`);
      return tuple;
    });
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
