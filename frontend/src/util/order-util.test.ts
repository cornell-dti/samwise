import { sortByOrder } from './order-util';

it('sortByOrder works', () => {
  const originalList = [{ order: 3 }, { order: 2 }, { order: 1 }];
  const sortedList = [{ order: 1 }, { order: 2 }, { order: 3 }];
  expect(sortByOrder(originalList)).toEqual(sortedList);
});

it('reorder works', () => {
  // TODO: FIXME
  console.log('hi');
});
