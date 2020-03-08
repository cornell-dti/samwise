import { Map } from 'immutable';

type IdOrder = { readonly id: string; readonly order: number };
type Views =
  | 'FutureView'
  | 'FocusView';

/**
 * Test whether the given list is sorted by increasing order.
 *
 * @param list the list to test whether things are sorted.
 */
function testSorted<T extends { readonly order: number }>(
  list: T[],
): void {
  for (let i = 0; i < list.length - 1; i += 1) {
    const item = list[i];
    const next = list[i + 1];
    if (item.order > next.order) {
      throw new Error('Not sorted!');
    }
  }
}

function testOrderUnique<T extends IdOrder>(list: T[]): void {
  const orders: Set<number> = new Set<number>();
  for (let i = 0; i < list.length - 1; i += 1) {
    const { order } = list[i];
    if (orders.has(order)) {
      throw new Error('Orders not unique!');
    }
    orders.add(order);
  }
}

/**
 * @param list the list to sort.
 * @returns the sorted list in increasing order.
 */
export function sortByOrder<T extends { readonly order: number }>(list: T[]): T[] {
  return [...list].sort((a, b) => a.order - b.order);
}

/**
 * Compute the reorder map after swapping items with order sourceOrder and destinationOrder.
 *
 * Contract:
 * - The original list will not be mutated.
 * - The sorted list obtained by applying the reordering map will satisfy the properties
 *   described in the reorder function below.
 *
 * @param originalList the original list as a reference.
 * @param sourceOrder where is the dragged item from.
 * @param destinationOrder where the dragged item goes.
 * @return the reordering map that maps id to new order.
 */
export function computeReorderMap<T extends IdOrder>(
  originalList: T[],
  sourceOrder: number,
  destinationOrder: number,
): Map<string, number> {
  if (sourceOrder === destinationOrder) {
    return Map.of();
  }
  testSorted(originalList);
  testOrderUnique(originalList);
  let reorderMap = Map<string, number>(); // key: id, value: new order
  const orders = originalList.map((t) => t.order);
  if (sourceOrder < destinationOrder) {
    // wants to go to later places
    originalList.forEach((element, i) => {
      if (element.order === sourceOrder) {
        reorderMap = reorderMap.set(element.id, destinationOrder);
      } else if (element.order > sourceOrder && element.order <= destinationOrder) {
        reorderMap = reorderMap.set(element.id, orders[i - 1]);
      }
    });
  } else {
    // wants to go to earlier places
    originalList.forEach((element, i) => {
      if (element.order === sourceOrder) {
        reorderMap = reorderMap.set(element.id, destinationOrder);
      } else if (element.order >= destinationOrder && element.order < sourceOrder) {
        reorderMap = reorderMap.set(element.id, orders[i + 1]);
      }
    });
  }
  return reorderMap;
}

/**
 * Apply the reorder map to an order list to obtained the sorted list.
 * The contract of the sorted list is described in the reorder function below.
 *
 * @param originalList the original list as a reference.
 * @param reorderMap the reorder map to apply.
 * @returns a new list with updated orders and the reordering map that maps id to new order.
 */
export function getReorderedList<T extends { readonly id: string; readonly order: number }>(
  originalList: T[],
  reorderMap: Map<string, number>,
  view: Views,
): T[] {
  const sortedList = [...originalList];
  for (let i = 0; i < sortedList.length; i += 1) {
    const element = sortedList[i];
    const newOrder = reorderMap.get(element.id);
    if (newOrder != null) {
      if (view === 'FocusView') {
        sortedList[i] = { ...element, order: newOrder };
      } else {
        sortedList[i] = { ...element, futureViewOrder: newOrder };
      }
    }
  }
  return sortedList.sort((a, b) => a.order - b.order);
}

/**
 * Reorder a list of items by swapping items with order sourceOrder and destinationOrder.
 *
 * Contract:
 * - The original list will not be mutated.
 * - The returned sorted list will satisfy these properties:
 *   - It is sorted in increaing order.
 *   - Only the order field is changed.
 *   - The order field of the original list items is maintained, except that
 *     - the order field of the swapped items are reversed.
 *     - the relative order of one of the items and all items in between the swapped items are
 *       reversed.
 * - The returned reorder map compactly describes all the order changes in an immutable map.
 *
 * @param originalList the original list as a reference.
 * @param sourceOrder where is the dragged item from.
 * @param destinationOrder where the dragged item goes.
 * @return a new list with updated orders and the reordering map that maps id to new order.
 */
export function reorder<T extends { readonly id: string; readonly order: number }>(
  originalList: T[],
  sourceOrder: number,
  destinationOrder: number,
  view: Views,
): T[] {
  const reorderMap = computeReorderMap(originalList, sourceOrder, destinationOrder);
  return getReorderedList(originalList, reorderMap, view);
}
