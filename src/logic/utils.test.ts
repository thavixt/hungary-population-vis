import { describe, it, expect } from 'vitest';
import { sortObjectByKeys } from './utils';

describe('sortObjectByKeys', () => {
  it('should return an empty object when given an empty object', () => {
    const result = sortObjectByKeys({});
    expect(result).toEqual({});
  });

  it('should return the same object when given an already sorted object', () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = sortObjectByKeys(obj);
    expect(result).toEqual(obj);
  });

  it('should return a sorted object when given an unsorted object', () => {
    const obj = { c: 3, a: 1, b: 2 };
    const expected = { a: 1, b: 2, c: 3 };
    const result = sortObjectByKeys(obj);
    expect(result).toEqual(expected);
  });

  it('should handle objects with numeric keys', () => {
    const obj = { 3: 'three', 1: 'one', 2: 'two' };
    const expected = { 1: 'one', 2: 'two', 3: 'three' };
    const result = sortObjectByKeys(obj);
    expect(result).toEqual(expected);
  });

  it('should handle objects with mixed key types', () => {
    const obj = { b: 2, 1: 'one', a: 1, 2: 'two' };
    const expected = { 1: 'one', 2: 'two', a: 1, b: 2 };
    const result = sortObjectByKeys(obj);
    expect(result).toEqual(expected);
  });
});