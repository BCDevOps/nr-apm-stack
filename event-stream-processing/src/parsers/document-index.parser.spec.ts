import {DocumentIndexParser} from './document-index.parser';
import {OsDocument} from '../types/os-document';

describe('IndexNameParser', () => {
  it('matches document with metadata field', () => {
    const parser = new DocumentIndexParser();

    expect(parser.matches({data: {'@metadata': {index: 'bob'}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {}} as unknown as OsDocument)).toBe(false);
  });

  it('adds index with no substitution', () => {
    const parser = new DocumentIndexParser();
    const document = {
      data: {
        '@timestamp': '2021-05-01T18:47:40.314-07:00',
        '@metadata': {
          index: 'nrm-logs-access',
        },
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document).toHaveProperty('index', 'nrm-logs-access');
  });

  it('adds index with @timestamp', () => {
    const parser = new DocumentIndexParser();
    const document = {
      data: {
        '@timestamp': '2021-05-01T18:47:40.314-07:00',
        '@metadata': {
          index: 'nrm-logs-access-<%=YYYY.MM.DD=%>',
        },
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document).toHaveProperty('index', 'nrm-logs-access-2021.05.01');
  });

  it('adds index with multiple substitutions', () => {
    const parser = new DocumentIndexParser();
    const document = {
      data: {
        '@timestamp': '2021-05-01T18:47:40.314-07:00',
        '@metadata': {
          index: 'nrm-logs-access-<%=YYYY.MM.DD=%>-<%=YYYY=%>',
        },
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document).toHaveProperty('index', 'nrm-logs-access-2021.05.01-2021');
  });

  it('adds index with field substitutions', () => {
    const parser = new DocumentIndexParser();
    const document = {
      data: {
        'labels': {
          cool: 'dude',
        },
        '@timestamp': '2021-05-01T18:47:40.314-07:00',
        '@metadata': {
          index: 'nrm-logs-<!=data-field=!>-access-<%=YYYY.MM.DD=%>',
          indexDataFieldSubstitute: 'labels.cool'
        },
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document).toHaveProperty('index', 'nrm-logs-dude-access-2021.05.01');
  });
  it('throws error with undefined field substitution', () => {
    const parser = new DocumentIndexParser();
    const document = {
      data: {
        '@timestamp': '2021-05-01T18:47:40.314-07:00',
        '@metadata': {
          index: 'nrm-logs-<!=labels.cool=!>-access-<%=YYYY.MM.DD=%>',
          indexDataFieldSubstitute: 'labels.cool'
        },
      },
    } as unknown as OsDocument;
    expect(() => {
      parser.apply(document);
    }).toThrow('labels.cool field value not in document');
  });

  it('throws error with no index metadata', () => {
    const parser = new DocumentIndexParser();
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
    const parser = new DocumentIndexParser();
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
