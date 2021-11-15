import {myContainer, TYPES} from './inversify.config';
import {KinesisStreamEvent, Context} from 'aws-lambda';
import {KinesisStreamService} from './kinesis-stream.service';

export const kinesisStreamHandler = async (event: KinesisStreamEvent, context: Context): Promise<void> => {
  return myContainer.get<KinesisStreamService>(TYPES.KinesisStreamService).handle(event, context)
    .catch((error) => {
      console.error(error);
    })
    .then(() => {
      // Return void promise
      return Promise.resolve();
    });
};
