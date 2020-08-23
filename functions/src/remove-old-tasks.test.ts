import { partition } from './remove-old-tasks';

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
});
