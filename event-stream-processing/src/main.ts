import {NestFactory} from '@nestjs/core';
import {AppModule} from './nest/app.module';
import {json} from 'body-parser';
/**
 * Bootstrap the nest application for localhost testing.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('json spaces', 2);
  app.use(json({limit: '50mb'}));
  await app.listen(3000);
}
void bootstrap();
