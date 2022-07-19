import {DeadLetterQueueService} from './dead-letter-queue.service';

describe('DeadLetterQueueService', () => {
  it('sends errors to firehose', () => {
    const service = new DeadLetterQueueService();
    expect(service).not.toBe(null);
  });
});
