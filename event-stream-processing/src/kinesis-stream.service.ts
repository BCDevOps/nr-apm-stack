/* eslint-disable @typescript-eslint/no-unsafe-call */
import {Context, KinesisStreamEvent} from 'aws-lambda';
import {injectable, inject} from 'inversify';
import {OpenSearchService} from './open-search.service';
import {TYPES} from './inversify.types';
import {LoggerService} from './util/logger.service';
import {EcsTransformService} from './ecs-transform.service';
import {BatchSummaryService} from './batch-summary.service';

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
    @inject(TYPES.BatchSummaryService) private batchSummary: BatchSummaryService,
    @inject(TYPES.LoggerService) private logger: LoggerService,
  ) {}

  /* eslint-disable @typescript-eslint/no-unused-vars */
  /**
   * Handle the Kinesis event by transforming and then bulk uploading to OpenSearch
   * @param event The event containing the data to transform
   * @param context The lambda context
   * @returns A promise to wait on
   */
  public async handle(event: KinesisStreamEvent, context: Context): Promise<void> {
    const receivedCount = event.Records.length;
    this.logger.debug(`Transforming ${receivedCount} kinesis records to OS documents`);
    // Extract records from Kinesis event to documents and process according to fingerprint & meta instructions
    const transformedPipeline = this.ecsTransformService.transform(event);
    const processedCount = transformedPipeline.documents.length;
    this.logger.debug(`Submitting ${processedCount} documents to OS`);
    // Bulk send documents
    const sentPipeline = await this.openSearch.bulk(transformedPipeline);
    // const recievedRecords = sentPipeline.documents.length;
    const committedCount = sentPipeline.documents.length;
    const failedCount = sentPipeline.failures.length;
    this.logger.debug(`${committedCount} documents added`);
    this.logger.debug(`${failedCount} documents failed`);
    this.batchSummary.logSummary(sentPipeline);
    this.batchSummary.logMessages(sentPipeline);

    return Promise<void>.resolve();
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
