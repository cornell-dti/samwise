import { sortByOrder, reorder } from './order-util';

it('sortByOrder works', () => {
  const originalList = [{ order: 3 }, { order: 2 }, { order: 1 }];
  const sortedList = [{ order: 1 }, { order: 2 }, { order: 3 }];
  expect(sortByOrder(originalList)).toEqual(sortedList);
});

type IdOrder = { readonly id: string; readonly order: number };

type ListInfo = {
  readonly idOrderMap: Map<string, number>;
  readonly orderIdMap: Map<number, string>;
  readonly allOrders: readonly number[];
};

function getInfoFromList(list: IdOrder[]): ListInfo {
  const idOrderMap = new Map<string, number>();
  const orderIdMap = new Map<number, string>();
  const allOrders: number[] = [];
  list.forEach(({ id, order }) => {
    idOrderMap.set(id, order);
    orderIdMap.set(order, id);
    allOrders.push(order);
  });
  return { idOrderMap, orderIdMap, allOrders };
}

function testOrderUnique(reorderList: IdOrder[]): void {
  const { allOrders: allNewOrders } = getInfoFromList(reorderList);
  const orderSet: Set<number> = new Set<number>();
  allNewOrders.forEach((order) => {
    expect(!orderSet.has(order));
    orderSet.add(order);
  });
}

/**
 * Test the contract for the reorder function (written in the function doc).
 *
 * @param list the list to run the test on. It must be sorted by order in increasing order.
 */
function testReorderContract(list: IdOrder[]): void {
  const { orderIdMap: originalOrderIdMap, allOrders: originalAllOrders } = getInfoFromList(list);
  const test = (srcOrder: number, destOrder: number): void => {
    let small: number;
    let big: number;
    if (srcOrder < destOrder) {
      small = srcOrder;
      big = destOrder;
    } else {
      small = destOrder;
      big = srcOrder;
    }
    const ordersBeforeSmall: number[] = [];
    const ordersAfterBig: number[] = [];
    const ordersInBetween: number[] = [];
    originalAllOrders.forEach((order) => {
      if (order < small) {
        ordersBeforeSmall.push(order);
      } else if (order > big) {
        ordersAfterBig.push(order);
      } else if (order > small && order < big) {
        ordersInBetween.push(order);
      }
    });
    const reorderedList = reorder(list, srcOrder, destOrder);
    const { idOrderMap: newIdOrderMap, allOrders: allNewOrders } = getInfoFromList(reorderedList);
    const getNewOrder = (oldOrder: number): number => {
      const id = originalOrderIdMap.get(oldOrder);
      if (id == null) {
        throw new Error();
      }
      const newOrder = newIdOrderMap.get(id);
      if (newOrder == null) {
        throw new Error();
      }
      return newOrder;
    };
    const checkOrderUnchanged = (order: number): void => {
      expect(getNewOrder(order)).toEqual(order);
    };
    // check all orders before small are unchanged
    ordersBeforeSmall.forEach(checkOrderUnchanged);
    // check all orders after large are unchanged
    ordersAfterBig.forEach(checkOrderUnchanged);
    // check the relative order of in between items are unchanged
    const newOrdersInBetween = ordersInBetween.map(getNewOrder);
    newOrdersInBetween.forEach((newOrder, i, newOrders) => {
      if (i > 0) {
        const lastOrder = newOrders[i - 1];
        expect(lastOrder).toBeLessThan(newOrder);
      }
    });
    // check the moved item get the desired order
    expect(getNewOrder(srcOrder)).toEqual(destOrder);
    // check the correct order between dest order and in between elements
    if (srcOrder < destOrder) {
      newOrdersInBetween.forEach((newInBetweenOrder) => {
        expect(newInBetweenOrder).toBeLessThan(destOrder);
      });
    } else {
      newOrdersInBetween.forEach((newInBetweenOrder) => {
        expect(newInBetweenOrder).toBeGreaterThan(destOrder);
      });
    }
    // check no duplicate orders
    expect(new Set(allNewOrders).size).toEqual(allNewOrders.length);
  };
  originalAllOrders.forEach((src) => originalAllOrders.forEach((dest) => test(src, dest)));
}

function testReorderUniqueOrders(list: IdOrder[]): void {
  const orders = list.map((l) => l.order);
  for (let i = 0; i < list.length - 1; i += 1) {
    const reorderList = reorder(list, orders[i], orders[list.length - 1]);
    testOrderUnique([...new Set([...reorderList, ...list])]);
  }
}

for (let i = 1; i < 5; i += 1) {
  const list: IdOrder[] = [];
  for (let order = 1; order <= i; order += 1) {
    const item = { id: String(order), order };
    list.push(item);
  }
  it(`reorder works on lists of size ${i}`, () => {
    testReorderContract(list);
  });
}

for (let i = 0; i < 5; i += 2) {
  const list: IdOrder[] = [];
  for (let order = 1; order <= i; order += 2) {
    const item = { id: String(order), order };
    list.push(item);
  }
  it(`reorder works on discontinuous order lists of ${list.length - 1 - i}`, () =>
    testReorderUniqueOrders(list));
}
