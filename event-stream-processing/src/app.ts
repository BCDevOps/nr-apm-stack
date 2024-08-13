import { myContainer, TYPES } from './inversify.config';
import { KinesisStreamEvent, Context } from 'aws-lambda';
import { KinesisStreamService } from './kinesis-stream.service';
import { KinesisStreamWrapperService } from './kinesis-stream-wrapper.service';

export const kinesisStreamHandler = async (
  event: KinesisStreamEvent,
  context: Context,
): Promise<void> => {
  return myContainer
    .get<KinesisStreamService>(TYPES.KinesisStreamService)
    .handle(event, context)
    .catch((error) => {
      console.error(error);
    })
    .then(() => {
      // Return void promise
      return Promise.resolve();
    });
};

export const kinesisStreamDummyHandler = async (
  event: KinesisStreamEvent,
  context: Context,
): Promise<void> => {
  return myContainer
    .get<KinesisStreamWrapperService>(TYPES.KinesisStreamWrapperService)
    .handle(event, context)
    .catch((error) => {
      console.error(error);
    })
    .then(() => {
      // Return void promise
      return Promise.resolve();
    });
};
