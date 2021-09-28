import {IndexNameParser} from './index-name.parser';
import {OsDocument} from '../types/os-document';

describe('IndexNameParser', () => {
  it('matches documents without an index', () => {
    const parser = new IndexNameParser();

    expect(parser.matches({data: {}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {_index: 'wee'}} as unknown as OsDocument)).toBe(false);
  });

  it('adds index with no subsitution', () => {
    const parser = new IndexNameParser();
    const document = {
      data: {
        '@timestamp': '2021-05-01T18:47:40.314-07:00',
        '@metadata': {
          index: 'nrm-logs-access',
        },
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('_index', 'nrm-logs-access');
  });

  it('adds index with @timestamp', () => {
    const parser = new IndexNameParser();
    const document = {
      data: {
        '@timestamp': '2021-05-01T18:47:40.314-07:00',
        '@metadata': {
          index: 'nrm-logs-access-<%=YYYY.MM.DD=%>',
        },
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('_index', 'nrm-logs-access-2021.05.01');
  });

  it('adds index with multiple subsitutions', () => {
    const parser = new IndexNameParser();
    const document = {
      data: {
        '@timestamp': '2021-05-01T18:47:40.314-07:00',
        '@metadata': {
          index: 'nrm-logs-access-<%=YYYY.MM.DD=%>-<%=YYYY=%>',
        },
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('_index', 'nrm-logs-access-2021.05.01-2021');
  });

  it('throws error with no index metadata', () => {
    const parser = new IndexNameParser();
    const document = {
      data: {
        '@timestamp': '2021-05-01T18:47:40.314-07:00',
        '@metadata': {},
      },
    } as unknown as OsDocument;
    expect(() => {
      parser.apply(document);
    }).toThrow('Could not map event to an index');
  });

  it('throws error with no @timestamp', () => {
    const parser = new IndexNameParser();
    const document = {
      data: {
        '@metadata': {
          index: 'nrm-logs-access-<%=YYYY.MM.DD=%>',
        },
      },
    } as unknown as OsDocument;
    expect(() => {
      parser.apply(document);
    }).toThrow('@timestamp field value has not been defined');
  });
});
