import {ParserKeyAsPath} from './parser.nest.svc';
test('agent', () => {
  const filter = new ParserKeyAsPath();
  const record: any = {
    'agent.version': '1.7.4',
    'agent.type': 'fluentbit',
  };
  filter.apply(record);
  expect(record).toHaveProperty('agent.version', '1.7.4');
  expect(record).toHaveProperty('agent.type', 'fluentbit');
  expect(record).toHaveProperty('agent', {version: '1.7.4', type: 'fluentbit'});
});
