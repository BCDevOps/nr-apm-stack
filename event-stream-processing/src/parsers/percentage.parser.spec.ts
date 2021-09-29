import {OsDocument} from '../types/os-document';
import {PercentageParser} from './percentage.parser';

describe('PercentageParser', () => {
  it('matches anything', () => {
    const parser = new PercentageParser();

    expect(parser.matches({data: {'@metadata': {percentage: true}}} as unknown as OsDocument)).toBe(true);
    expect(parser.matches({data: {'@metadata': {}}} as unknown as OsDocument)).toBe(false);
  });

  it('percentage fields', () => {
    const parser = new PercentageParser();
    const document = {
      data: {'values': {num: 1, den: 2}, '@metadata': {percentage: 'values.num:values.den:values.rat'}},
    } as unknown as OsDocument;
    parser.apply(document);
    expect(document.data.values).toEqual({
      num: 1, den: 2, rat: 0.5,
    });
  });
});
