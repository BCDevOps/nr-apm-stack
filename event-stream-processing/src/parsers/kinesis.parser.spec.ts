import {DateAndTimeService} from '../shared/date-and-time.service';
import {OsDocument} from '../types/os-document';
import {KinesisParser} from './kinesis.parser';

jest.mock('../shared/date-and-time.service');

describe('KinesisParser', () => {
  it('matches anything', () => {
    const parser = new KinesisParser({} as unknown as DateAndTimeService);

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
    const parser = new KinesisParser(dateTimeService);
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
      },
      kinesis: {
        eventID: 'endofdino',
      },
    });
  });

  it('sets kinesis related fields (debug)', () => {
    const dateTimeService = {
      now: jest.fn(() => {
        return dateTimeService;
      }),
      toISOString: jest.fn(() => {
        return 'date';
      }),
    } as unknown as DateAndTimeService;
    const parser = new KinesisParser(dateTimeService);
    const document = {
      record: {
        eventID: 'endofdino',
        kinesis: {
          partitionKey: 'best',
          sequenceNumber: '1234',
          approximateArrivalTimestamp: 'cretaous',
        },
      },
      data: {
        '@metadata': {kinesis: 'debug'},
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toEqual({
      'event': {
        ingested: 'date',
      },
      'kinesis': {
        eventID: 'endofdino',
        partitionKey: 'best',
        sequenceNumber: '1234',
        approximateArrivalTimestamp: 'cretaous',
      },
      '@metadata': {kinesis: 'debug'},
    });
  });
});
