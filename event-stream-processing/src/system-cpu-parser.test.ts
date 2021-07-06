import {SystemCpuParser} from './system-cpu-parser';

test('basic', () => {
  const filter = new SystemCpuParser();
  const record = {
    event: {kind: 'kind', dataset: 'system.cpu'},
    agent: {type: 'fluentbit'},
    user_p: 1,
    system_p: 2,
    cpu_p: 3,
  };
  filter.apply(record);
  expect(record).not.toHaveProperty('user_p');
  expect(record).not.toHaveProperty('system_p');
  expect(record).not.toHaveProperty('cpu_p');
  expect(record).toHaveProperty('system.cpu.user.pct', 1);
  expect(record).toHaveProperty('system.cpu.system.pct', 2);
  expect(record).toHaveProperty('system.cpu.total.pct', 3);
});
