import { partition } from './util';

type ArbitraryTestingType = { a: string; b: number };

it('partition works', () => {
  expect(partition(['1', '2', '3', '4', '5', '6'], 2)).toEqual([
    ['1', '2'],
    ['3', '4'],
    ['5', '6'],
  ]);
  expect(partition(['1', '2', '3', '4', '5', '6'], 3)).toEqual([
    ['1', '2', '3'],
    ['4', '5', '6'],
  ]);
  expect(partition(['1', '2', '3', '4', '5'], 2)).toEqual([['1', '2'], ['3', '4'], ['5']]);
  expect(partition(['1', '2', '3', '4', '5'], 3)).toEqual([
    ['1', '2', '3'],
    ['4', '5'],
  ]);
  // test for different types
  expect(partition([1, 3, 5, 7, 9], 3)).toEqual([
    [1, 3, 5],
    [7, 9],
  ]);
  const obj1: ArbitraryTestingType = {
    a: 'a',
    b: 1,
  };
  const obj2: ArbitraryTestingType = {
    a: 'b',
    b: 2,
  };
  const obj3: ArbitraryTestingType = {
    a: 'c',
    b: 3,
  };
  expect(partition<ArbitraryTestingType>([obj1, obj2, obj3], 2)).toEqual([[obj1, obj2], [obj3]]);
});
