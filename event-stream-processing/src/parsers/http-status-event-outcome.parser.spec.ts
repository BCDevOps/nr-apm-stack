import {OsDocument} from '../types/os-document';
import {HttpStatusEventOutcomeParser} from './http-status-event-outcome.parser';

describe('HttpStatusEventOutcomeParser', () => {
  it('matches only if http.response.status_code is set', () => {
    const parser = new HttpStatusEventOutcomeParser();
    expect(parser.matches({data: {http: {response: {status_code: 200}}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {}} as unknown as OsDocument)).toBe(false);
  });

  it('does not match if event.outcome set already', () => {
    const parser = new HttpStatusEventOutcomeParser();
    expect(parser.matches({data: {event: {outcome: 'success'}}} as unknown as OsDocument)).toBe(false);
  });

  it('sets event success for status_code > 200', () => {
    const parser = new HttpStatusEventOutcomeParser();
    const document = {data: {http: {response: {status_code: 200}}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.event.outcome).toEqual('success');
  });

  it('sets event success for status_code = 401', () => {
    const parser = new HttpStatusEventOutcomeParser();
    const document = {data: {http: {response: {status_code: 401}}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.event.outcome).toEqual('success');
  });

  it('sets event success for status_code = 403', () => {
    const parser = new HttpStatusEventOutcomeParser();
    const document = {data: {http: {response: {status_code: 403}}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.event.outcome).toEqual('success');
  });

  it('sets event failure for status_code = 400', () => {
    const parser = new HttpStatusEventOutcomeParser();
    const document = {data: {http: {response: {status_code: 400}}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.event.outcome).toEqual('failure');
  });

  it('sets event failure for status_code = 500', () => {
    const parser = new HttpStatusEventOutcomeParser();
    const document = {data: {http: {response: {status_code: 500}}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.event.outcome).toEqual('failure');
  });

  it('sets event unknown for status_code = 600', () => {
    const parser = new HttpStatusEventOutcomeParser();
    const document = {data: {http: {response: {status_code: 600}}}} as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.event.outcome).toEqual('unknown');
  });
});
