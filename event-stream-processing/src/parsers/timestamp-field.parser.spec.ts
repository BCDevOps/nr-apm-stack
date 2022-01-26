import {OsDocument} from '../types/os-document';
import {TimestampFieldParser} from './timestamp-field.parser';

describe('TimestampFieldParser', () => {
  it('matches using metadata and dataExtractedTimestamp', () => {
    const parser = new TimestampFieldParser();
    expect(parser.matches({data: {}} as unknown as OsDocument)).toBe(false);
    expect(parser.matches({data: {'@metadata': {'timestampField': 'blah'}}} as unknown as OsDocument)).toBe(false);
    expect(parser.matches({
      data: {'@metadata': {'timestampField': 'blah', 'timestampFormat': 'blah'}},
    } as unknown as OsDocument)).toBe(true);
    expect(parser.matches({
      dataExtractedTimestamp: 'blah',
      data: {'@metadata': {'timestampFormat': 'blah'}},
    } as unknown as OsDocument)).toBe(true);
  });

  it('throws error when no value set', () => {
    const parser = new TimestampFieldParser();
    const document = {
      data: {
        '@metadata': {
          timestampField: 'field',
          timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
        },
        'field': '',
      },
    } as unknown as OsDocument;
    expect(() => {
      parser.apply(document);
    }).toThrow('No value set for timestamp: field');
  });

  it('throws error when invalid value set', () => {
    const parser = new TimestampFieldParser();
    const document = {
      data: {
        '@metadata': {
          timestampField: 'field',
          timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
        },
        'field': 'fefefef',
      },
    } as unknown as OsDocument;
    expect(() => {
      parser.apply(document);
    }).toThrow('Invalid Date: fefefef');
  });

  it('parses apache timestamp', () => {
    const parser = new TimestampFieldParser();
    const document = {
      data: {
        '@metadata': {
          timestampField: 'field',
          timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
        },
        'field': '05/Jun/2020:07:23:23 -0700',
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data['@timestamp']).toEqual('2020-06-05T07:23:23.000-07:00');
  });

  it('parses another timestamp', () => {
    const parser = new TimestampFieldParser();
    const document = {
      data: {
        '@metadata': {
          timestampField: 'field',
          timestampFormat: 'DD MM YYYY hh:mm:ss Z',
        },
        'field': '05 06 2020 07:23:23 -0700',
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data['@timestamp']).toEqual('2020-06-05T07:23:23.000-07:00');
  });

  it('parses timestamp in dataExtractedTimestamp', () => {
    const parser = new TimestampFieldParser();
    const document = {
      dataExtractedTimestamp: '05/Jun/2020:07:23:23 -0700',
      data: {
        '@metadata': {
          timestampFormat: 'DD/MMM/YYYY:HH:mm:ss Z',
        },
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data['@timestamp']).toEqual('2020-06-05T07:23:23.000-07:00');
  });
});
