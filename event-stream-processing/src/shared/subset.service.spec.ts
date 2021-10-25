import {SubsetService} from './subset.service';

describe('SubsetService', () => {
  it('tests true for a subset', () => {
    const subset = new SubsetService();
    const rval = subset.isSubset({a: 'foo', b: 'bar'}, {a: 'foo'});
    expect(rval).toBe(true);
  });

  it('tests false for a non-subset', () => {
    const subset = new SubsetService();
    const rval = subset.isSubset({a: 'foo'}, {a: 'foo', b: 'bar'});
    expect(rval).toBe(false);
  });

  it('tests true for equality', () => {
    const subset = new SubsetService();
    const rval = subset.isSubset({a: 'foo', b: {bar: 'bar'}}, {a: 'foo', b: {bar: 'bar'}});
    expect(rval).toBe(true);
  });

  it('tests false if one is null', () => {
    const subset = new SubsetService();
    expect(subset.isSubset({a: 'foo', b: 'bar'}, null)).toBe(false);
    expect(subset.isSubset(null, {a: 'foo', b: 'bar'})).toBe(false);
  });
});
