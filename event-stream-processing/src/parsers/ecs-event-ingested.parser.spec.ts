import {DateAndTimeService} from '../shared/date-and-time.service';
import {OsDocument} from '../types/os-document';
import {EcsEventIngestedParser} from './ecs-event-ingested.parser';

jest.mock('../shared/date-and-time.service');

describe('EcsEventIngestedParser', () => {
  it('matches anything', () => {
    const parser = new EcsEventIngestedParser({} as unknown as DateAndTimeService);

    expect(parser.matches()).toBe(true);
  });

  it('sets kinesis related fields', () => {
    const dateTimeService = {
      now: jest.fn(() => {
        return dateTimeService;
      }),
      toISOString: jest.fn(() => {
        return 'date';
      }),
    } as unknown as DateAndTimeService;
    const parser = new EcsEventIngestedParser(dateTimeService);
    const document = {
      record: {
        eventID: 'endofdino',
        kinesis: {
          partitionKey: 'best',
          sequenceNumber: '1234',
          approximateArrivalTimestamp: 'cretaous',
        },
      },
      data: {},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toEqual({
      event: {
        ingested: 'date',
        kinesis: {
          eventID: 'endofdino',
          partitionKey: 'best',
          sequenceNumber: '1234',
          approximateArrivalTimestamp: 'cretaous',
        },
      },
    });
  });
});
