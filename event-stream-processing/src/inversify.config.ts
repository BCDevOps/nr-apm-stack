import {Container, BindingScopeEnum} from 'inversify';
import {TYPES} from './inversify.types';

// Services
import {AwsHttpClientService} from './util/aws-http-client.service';
import {DateAndTimeService} from './shared/date-and-time.service';
import {EcsTransformService} from './ecs-transform.service';
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

/**
 * Create the container
 * @returns The container
 */
function create(): Container {
  const myContainer = new Container({defaultScope: BindingScopeEnum.Singleton});
  myContainer.bind<LoggerService>(TYPES.LoggerService).to(LoggerConsoleService);
  myContainer.bind<EcsTransformService>(TYPES.EcsTransformService).to(EcsTransformService);
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
  myContainer.bind<Parser>(TYPES.InitParser).to(KeyAsPathParser);
  myContainer.bind<Parser>(TYPES.InitParser).to(KinesisParser);

  // Stage: PreParse
  myContainer.bind<Parser>(TYPES.PreParser).to(ApacheParser);
  myContainer.bind<Parser>(TYPES.PreParser).to(RenameParser);

  // Stage: Parse
  myContainer.bind<Parser>(TYPES.Parser).to(DeslashParser);
  myContainer.bind<Parser>(TYPES.Parser).to(HttpUrlParser);
  myContainer.bind<Parser>(TYPES.Parser).to(HttpStatusEventOutcomeParser);
  myContainer.bind<Parser>(TYPES.Parser).to(IpvParser);
  myContainer.bind<Parser>(TYPES.Parser).to(JoinKvParser);
  myContainer.bind<Parser>(TYPES.Parser).to(GeoIpParser);
  myContainer.bind<Parser>(TYPES.Parser).to(UserAgentParser);
  myContainer.bind<Parser>(TYPES.Parser).to(FileAttributeParser);
  myContainer.bind<Parser>(TYPES.Parser).to(ApplicationClassificationParser);
  myContainer.bind<Parser>(TYPES.Parser).to(ThreatPhpParser);

  // Stage: Post Parse
  myContainer.bind<Parser>(TYPES.PostParser).to(HashParser);

  // Stage: FINALIZE
  myContainer.bind<Parser>(TYPES.FinalizeParser).to(TimestampFieldParser);
  myContainer.bind<Parser>(TYPES.FinalizeParser).to(DocumentIndexParser);
  myContainer.bind<Parser>(TYPES.FinalizeParser).to(DocumentIdParser);
  myContainer.bind<Parser>(TYPES.FinalizeParser).to(RemoveMetadataParser);

  return myContainer;
}
const myContainer = create();

export {myContainer, TYPES};
