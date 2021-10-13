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
import {LoggerConsoleService} from './util/logger-console.service';
import {LoggerService} from './util/logger.service';
import {MaxmindCityLookupService} from './util/maxmindCityLookup.service';
import {MaxmindAsnLookupService} from './util/maxmindAsnLookup.service';
import {SubsetService} from './shared/subset.service';

// Parsers
import {Parser} from './types/parser';
import {ApacheParser} from './parsers/apache.parser';
import {ApplicationClassificationParser} from './parsers/application-classification.parser';
import {DeslashParser} from './parsers/deslash.parser';
import {DocumentIdParser} from './parsers/document-id.parser';
import {DocumentIndexParser} from './parsers/document-index.parser';
import {FileAttributeParser} from './parsers/file-attribute.parser';
import {KinesisParser} from './parsers/kinesis.parser';
import {GeoIpParser} from './parsers/geo-ip.parser';
import {HashParser} from './parsers/hash.parser';
import {HttpStatusEventOutcomeParser} from './parsers/http-status-event-outcome.parser';
import {HttpUrlParser} from './parsers/http-url.parser';
import {IpvParser} from './parsers/ipv.parser';
import {JoinKvParser} from './parsers/join-kv.parser';
import {KeyAsPathParser} from './parsers/key-as-path.parser';
import {RemoveMetadataParser} from './parsers/remove-metadata.parser';
import {RenameParser} from './parsers/rename.parser';
import {ThreatPhpParser} from './parsers/threat-php.parser';
import {TimestampFieldParser} from './parsers/timestamp-field.parser';
import {UserAgentParser} from './parsers/user-agent.parser';

export const TAG_STAGE = 'stage';
export const STAGE_INIT = 'init';
export const STAGE_PRE_PARSE = 'pre_parse';
export const STAGE_PARSE = 'parse';
export const STAGE_POST_PARSE = 'post_parse';
export const STAGE_FINALIZE = 'finalize';

/**
 * Create the container
 * @returns The container
 */
function create(): Container {
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
  myContainer.bind<DateAndTimeService>(TYPES.DateAndTimeService).to(DateAndTimeService);
  myContainer.bind<SubsetService>(TYPES.SubsetService).to(SubsetService);

  // Stage: INIT
  myContainer.bind<Parser>(TYPES.Parser).to(KeyAsPathParser).whenTargetTagged(TAG_STAGE, STAGE_INIT);
  myContainer.bind<Parser>(TYPES.Parser).to(KinesisParser).whenTargetTagged(TAG_STAGE, STAGE_INIT);

  // Stage: Pre Parse
  myContainer.bind<Parser>(TYPES.Parser).to(ApacheParser).whenTargetTagged(TAG_STAGE, STAGE_PRE_PARSE);

  // Stage: Parse
  myContainer.bind<Parser>(TYPES.Parser).to(DeslashParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(HttpUrlParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(HttpStatusEventOutcomeParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(IpvParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(JoinKvParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(GeoIpParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(UserAgentParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(FileAttributeParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(ApplicationClassificationParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(ThreatPhpParser).whenTargetTagged(TAG_STAGE, STAGE_PARSE);

  // Stage: Post Parse
  myContainer.bind<Parser>(TYPES.Parser).to(RenameParser).whenTargetTagged(TAG_STAGE, STAGE_POST_PARSE);
  myContainer.bind<Parser>(TYPES.Parser).to(HashParser).whenTargetTagged(TAG_STAGE, STAGE_POST_PARSE);

  // Stage: FINALIZE
  myContainer.bind<Parser>(TYPES.Parser).to(TimestampFieldParser).whenTargetTagged(TAG_STAGE, STAGE_FINALIZE);
  myContainer.bind<Parser>(TYPES.Parser).to(DocumentIndexParser).whenTargetTagged(TAG_STAGE, STAGE_FINALIZE);
  myContainer.bind<Parser>(TYPES.Parser).to(DocumentIdParser).whenTargetTagged(TAG_STAGE, STAGE_FINALIZE);
  myContainer.bind<Parser>(TYPES.Parser).to(RemoveMetadataParser).whenTargetTagged(TAG_STAGE, STAGE_FINALIZE);

  return myContainer;
}
const myContainer = create();

export {myContainer, TYPES};
