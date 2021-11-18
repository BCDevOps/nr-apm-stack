import {NestFactory} from '@nestjs/core';
import {AppModule} from './nest/app.module';

/**
 * Bootstrap the nest application for localhost testing.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().set('json spaces', 2);
  await app.listen(3000);
}
void bootstrap();
