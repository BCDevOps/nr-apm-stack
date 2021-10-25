import {OsDocument} from '../types/os-document';
import {KeyAsPathParser} from './key-as-path.parser';

describe('KeyAsPathParser', () => {
  it('matches using metadata', () => {
    const parser = new KeyAsPathParser();
    expect(parser.matches({data: {}} as unknown as OsDocument)).toBe(false);
    expect(parser.matches({data: {'@metadata': {'keyAsPath': true}}} as unknown as OsDocument)).toBe(true);
  });

  it('parses dots as paths', () => {
    const parser = new KeyAsPathParser();
    const document = {
      data: {
        'message': 'meow',
        'agent.version': '1.7.4',
        'agent.type': 'fluentbit',
      },
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data).toHaveProperty('agent.version', '1.7.4');
    expect(document.data).toHaveProperty('agent.type', 'fluentbit');
    expect(document.data).toHaveProperty('agent', {version: '1.7.4', type: 'fluentbit'});
    expect(document.data.message).toBe('meow');
  });
});
