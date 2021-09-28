import {Container, BindingScopeEnum} from 'inversify';
import {TYPES} from './inversify.types';

// Services
import {AwsHttpClientService} from './util/aws-http-client.service';
import {DateAndTimeService} from './shared/date-and-time.service';
import {GeoIpService} from './util/geoip.service';
import {GeoIpMaxmindService} from './util/geoip-maxmind.service';
import {OpenSearchService} from './open-search.service';
import {KinesisStreamRecordMapperService} from './shared/kinesis-stream-record-mapper.service';
import {KinesisStreamService} from './kinesis-stream.service';
import {RandomizerService} from './util/randomizer.service';
import {MaxmindCityLookupService} from './util/maxmindCityLookup.service';
import {MaxmindAsnLookupService} from './util/maxmindAsnLookup.service';
import {SubsetService} from './shared/subset.service';

// Parsers
import {Parser} from './types/parser';
import {ApacheParser} from './parsers/apache.parser';
import {ApplicationClassificationParser} from './parsers/application-classification.parser';
import {EcsParser} from './parsers/ecs.parser';
import {EcsEventIngestedParser} from './parsers/ecs-event-ingested.parser';
import {FingerprintFilterParser} from './parsers/fingerprint-filter.parser';
import {GeoIpParser} from './parsers/geo-ip.parser';
import {HttpStatusEventOutcomeParser} from './parsers/http-status-event-outcome.parser';
import {IndexNameParser} from './parsers/index-name.parser';
import {KeyAsPathParser} from './parsers/key-as-path.parser';
import {LoggerService} from './util/logger.service';
import {LoggerConsoleService} from './util/logger-console.service';
import {RemoveMetadataParser} from './parsers/remove-metadata.parser';
import {SystemCpuParser} from './parsers/system-cpu.parser';
import {SystemMemoryParser} from './parsers/system-memory.parser';
import {ThreatPhpParser} from './parsers/threat-php.parser';
import {UserAgentParser} from './parsers/user-agent.parser';
import {TimestampFieldParser} from './parsers/timestamp-field.parser';

export const TAG_STAGE = 'stage';
export const STAGE_FINGERPRINT = 'fingerprint';
export const STAGE_PARSE = 'parse';
export const STAGE_FINALIZE = 'finalize';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace globalThis {
  // eslint-disable-next-line camelcase
  let __inversify_singleton: Container;
}

/**
 * Create the container
 * @returns The container
 */
export function create(): Container {
  const myContainer = new Container({defaultScope: BindingScopeEnum.Singleton});
  myContainer.bind<LoggerService>(TYPES.LoggerService).to(LoggerConsoleService);
  myContainer.bind<GeoIpService>(TYPES.GeoIpService).to(GeoIpMaxmindService);
  myContainer.bind<MaxmindCityLookupService>(TYPES.MaxmindCityLookupService).to(MaxmindCityLookupService);
  myContainer.bind<MaxmindAsnLookupService>(TYPES.MaxmindAsnLookupService).to(MaxmindAsnLookupService);
  myContainer.bind<AwsHttpClientService>(TYPES.AwsHttpClientService).to(AwsHttpClientService);
  myContainer.bind<OpenSearchService>(TYPES.OpenSearchService).to(OpenSearchService);
  myContainer.bind<KinesisStreamRecordMapperService>(TYPES.KinesisStreamRecordMapperService)
    .to(KinesisStreamRecordMapperService);
  myContainer.bind<KinesisStreamService>(TYPES.KinesisStreamService).to(KinesisStreamService);
  myContainer.bind<RandomizerService>(TYPES.RandomizerService).to(RandomizerService);
  myContainer.bind<DateAndTimeService>(TYPES.DateAndTimeService).to(DateAndTimeService);
  myContainer.bind<SubsetService>(TYPES.SubsetService).to(SubsetService);

  // Stage: FINGERPRINT
  myContainer.bind<Parser>(TYPES.Parser).to(KeyAsPathParser).whenTargetTagged(TAG_STAGE, STAGE_FINGERPRINT);
  myContainer.bind<Parser>(TYPES.Parser).to(EcsEventIngestedParser).whenTargetTagged(TAG_STAGE, STAGE_FINGERPRINT);

  // Stage: Parse
  // myContainer.bind<Parser>(TYPES.Parser).to(FingerprintFilterParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  // myContainer.bind<Parser>(TYPES.Parser).to(ApacheParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  // myContainer.bind<Parser>(TYPES.Parser).to(SystemCpuParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  // myContainer.bind<Parser>(TYPES.Parser).to(SystemMemoryParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  // myContainer.bind<Parser>(TYPES.Parser).to(EcsParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(ApplicationClassificationParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(HttpStatusEventOutcomeParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  // myContainer.bind<Parser>(TYPES.Parser).to(GeoIpParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(UserAgentParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  // myContainer.bind<Parser>(TYPES.Parser).to(ThreatPhpParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);

  // Stage: FINALIZE
  myContainer.bind<Parser>(TYPES.Parser).to(TimestampFieldParser).whenTargetTagged(TAG_STAGE, STAGE_FINALIZE);
  myContainer.bind<Parser>(TYPES.Parser).to(IndexNameParser).whenTargetTagged(TAG_STAGE, STAGE_FINALIZE);
  myContainer.bind<Parser>(TYPES.Parser).to(RemoveMetadataParser).whenTargetTagged(TAG_STAGE, STAGE_FINALIZE);

  return myContainer;
}
if (!globalThis.__inversify_singleton) {
  // console.log('creating __inversify_singleton')
  globalThis.__inversify_singleton = create();
}
const myContainer = globalThis.__inversify_singleton;

export {myContainer, TYPES};
