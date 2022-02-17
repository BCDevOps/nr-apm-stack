import moment from 'moment';
import {OsDocument} from '../types/os-document';
import {TimestampGuardParser} from './timestamp-guard.parser';

describe('TimestampGuardParser', () => {
  it('matches using metadata', () => {
    const parser = new TimestampGuardParser();

    expect(parser.matches({data: {'@metadata': {timestampGuard: 'P1D,P2D'}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('Does not throw if within guard', () => {
    const parser = new TimestampGuardParser();

    expect(() => {
      parser.apply({
        data: {
          '@timestamp': moment().subtract(moment.duration('PT5M')).toISOString(),
          '@metadata': {timestampGuard: 'P1D,P1D'},
        },
      } as unknown as OsDocument);
    }).not.toThrow();
  });

  it('Throws if outside guard', () => {
    const parser = new TimestampGuardParser();

    expect(() => {
      parser.apply({
        data: {
          '@timestamp': moment().subtract(moment.duration('P5D')).toISOString(),
          '@metadata': {timestampGuard: 'P1D,P1D'},
        },
      } as unknown as OsDocument);
    }).toThrow();
  });

  it('defaults to 1 minute forward allowed by default', () => {
    const parser = new TimestampGuardParser();

    expect(() => {
      parser.apply({
        data: {
          '@timestamp': moment().add(moment.duration('PT30S')).toISOString(),
          '@metadata': {timestampGuard: 'P1D'},
        },
      } as unknown as OsDocument);
    }).not.toThrow();

    expect(() => {
      parser.apply({
        data: {
          '@timestamp': moment().add(moment.duration('PT1M10S')).toISOString(),
          '@metadata': {timestampGuard: 'P1D'},
        },
      } as unknown as OsDocument);
    }).toThrow();
  });
});
