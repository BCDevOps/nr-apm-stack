import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const handledVal = {};
  const appService = {
    handleKinesisEvent: jest.fn().mockResolvedValue(handledVal),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    })
      .overrideProvider(AppService)
      .useValue(appService)
      .compile();

    appController = app.get<AppController>(AppController);
    jest.clearAllMocks();
  });

  describe('root', () => {
    it('should handleKinesisEvent when print false"', async () => {
      await appController.handleData({}, '');

      expect(appService.handleKinesisEvent).toHaveBeenCalledTimes(1);
      expect(appService.handleKinesisEvent).toHaveBeenCalledWith({}, false);
    });

    it('should handleKinesisEvent when print true"', async () => {
      await appController.handleData(expect.any(Object), 'true');

      expect(appService.handleKinesisEvent).toHaveBeenCalledTimes(1);
      expect(appService.handleKinesisEvent).toHaveBeenCalledWith(
        expect.any(Object),
        true,
      );
    });
  });
});
