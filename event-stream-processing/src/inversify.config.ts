import {Container, BindingScopeEnum} from 'inversify';
import {TYPES} from './inversify.types';
import {GeoIp} from './geoip.isvc';
import {Parser} from './parser.isvc';
import {GeoIpImpl} from './geoip.svc';
import {ParserApacheImpl} from './parser.apache.svc';
import {OpenSearch} from './opensearch.isvc';
import {OpenSearchImpl} from './opensearch.svc';
import {KinesisStreamHandlerImpl} from './kinesisStreamHandler.svc';
import {KinesisStreamHandler} from './kinesisStreamHandler.isvc';
import {AwsHttpClientImpl} from './aws-http-client.svc';
import {AwsHttpClient} from './aws-http-client.isvc';
import {Randomizer} from './randomizer.isvc';
import {RandomImpl} from './randomizer.svc';
import {MaxmindAsnLookup, MaxmindCityLookup} from './maxmindLookup.isvc';
import {MaxmindCityLookupmpl} from './maxmindCityLookup.svc';
import {MaxmindAsnLookupImpl} from './maxmindAsnLookup.svc';
import {ParserApplicationClasification} from './parser.apps.svc';
import {ParserHttpStatusCodeToEventOutCome} from './parser.http.outcome';
import {ParserEcs} from './parser.ecs.svc';
import {ParserEcsEventIngested} from './parser.ecs.event.ingested.svc';
import {ParserKeyAsPath} from './parser.nest.svc';
import {Logger} from './logger.isvc';
import {LoggerImpl} from './logger.svc';
import {ThreatPhpImpl} from './threat.php';
import {ParserUserAgent} from './parser.ua.svc';
import {ParserGeoIp} from './parser.geo.svc';
import {FingerprintFilter} from './fingerprint-filter';
import {SystemCpuParser} from './system-cpu-parser';
import {SystemMemoryParser} from './system-memory-parser';
import {IndexNameAssigner} from './index-name-assigner';
import {RemoveMetadataField} from './remove-metadata-field';
import {DateAndTimeImpl} from './shared/date-and-time-impl';
import {DateAndTime} from './shared/date-and-time';
import {NodeCssParser} from './node-css-parser';

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace globalThis {
  // eslint-disable-next-line camelcase
  let __inversify_singleton: Container;
}

export function create() {
  const myContainer = new Container({defaultScope: BindingScopeEnum.Singleton});
  myContainer.bind<Logger>(TYPES.Logger).to(LoggerImpl);
  myContainer.bind<GeoIp>(TYPES.GeoIp).to(GeoIpImpl);
  myContainer.bind<MaxmindCityLookup>(TYPES.MaxmindCityLookup).to(MaxmindCityLookupmpl);
  myContainer.bind<MaxmindAsnLookup>(TYPES.MaxmindAsnLookup).to(MaxmindAsnLookupImpl);

  myContainer.bind<Parser>(TYPES.Parser).to(ParserKeyAsPath);
  myContainer.bind<Parser>(TYPES.Parser).to(NodeCssParser);
  myContainer.bind<Parser>(TYPES.Parser).to(FingerprintFilter);
  myContainer.bind<Parser>(TYPES.Parser).to(ParserApacheImpl);
  myContainer.bind<Parser>(TYPES.Parser).to(SystemCpuParser);
  myContainer.bind<Parser>(TYPES.Parser).to(SystemMemoryParser);
  myContainer.bind<Parser>(TYPES.Parser).to(ParserEcs);
  myContainer.bind<Parser>(TYPES.Parser).to(ParserApplicationClasification);
  myContainer.bind<Parser>(TYPES.Parser).to(ParserHttpStatusCodeToEventOutCome);
  myContainer.bind<Parser>(TYPES.Parser).to(ParserGeoIp);
  myContainer.bind<Parser>(TYPES.Parser).to(ParserUserAgent);
  myContainer.bind<Parser>(TYPES.Parser).to(ParserEcsEventIngested);
  myContainer.bind<Parser>(TYPES.Parser).to(ThreatPhpImpl);
  myContainer.bind<Parser>(TYPES.Parser).to(IndexNameAssigner);
  myContainer.bind<Parser>(TYPES.Parser).to(RemoveMetadataField);

  myContainer.bind<AwsHttpClient>(TYPES.AwsHttpClient).to(AwsHttpClientImpl);
  myContainer.bind<OpenSearch>(TYPES.OpenSearch).to(OpenSearchImpl);
  myContainer.bind<KinesisStreamHandler>(TYPES.KnesisStreamHandler).to(KinesisStreamHandlerImpl);
  myContainer.bind<Randomizer>(TYPES.Randomizer).to(RandomImpl);
  myContainer.bind<DateAndTime>(TYPES.DateAndTime).to(DateAndTimeImpl);
  return myContainer;
}
if (!globalThis.__inversify_singleton) {
  // console.log('creating __inversify_singleton')
  globalThis.__inversify_singleton = create();
}
const myContainer = globalThis.__inversify_singleton;

export {myContainer, TYPES};
