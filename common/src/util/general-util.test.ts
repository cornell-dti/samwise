import { randomId, identity, ignore, error, shallowEqual, shallowArrayEqual } from './general-util';

it('randomId is always positive', () => {
  for (let i = 0; i < 100; i += 1) {
    expect(parseInt(randomId(), 10)).toBeGreaterThanOrEqual(0);
  }
});

it('identity function works', () => {
  const object = { foo: 'bar' };
  expect(identity(object)).toBe(object);
});

it('ignore does not crash', () => ignore());

it('error always crash', () => {
  expect(() => error('')).toThrowError('');
  expect(() => error('ah')).toThrowError('ah');
});

it('shallowEqualWorks', () => {
  expect(shallowEqual({ foo: 'bar', bar: 'foo' }, { foo: 'bar', bar: 'foo' })).toBeTruthy();
  expect(shallowEqual({ foo: 'bar', bar: 'foo' }, { foo: 'bar' })).toBeFalsy();
  expect(shallowEqual({ foo: 'bar', bar: 'foo' }, { foo: 'bar', bar: 'bar' })).toBeFalsy();
  expect(shallowEqual({ foo: 'bar', bar: 'foo' }, { foo: 'bar', baz: 'foo' })).toBeFalsy();
});

it('shallowArrayEqualWorks', () => {
  expect(shallowArrayEqual([{ foo: 'bar', bar: 'foo' }], [{ foo: 'bar', bar: 'foo' }])).toBeTruthy();
  expect(shallowArrayEqual([{ foo: 'bar', bar: 'foo' }], [])).toBeFalsy();
  expect(shallowArrayEqual([{ foo: 'bar', bar: 'foo' }], [{ foo: 'bar' }])).toBeFalsy();
});
