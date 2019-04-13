import { Map } from 'immutable';

/**
 * @param list the list to sort.
 * @returns the sorted list in increasing order.
 */
export function sortByOrder<T extends { readonly order: number }>(list: T[]): T[] {
  return list.sort((a, b) => a.order - b.order);
}

/**
 * Reorder a list of items by swapping items with order sourceOrder and destinationOrder
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
): { readonly sortedList: T[]; readonly reorderMap: Map<string, number> } {
  const sortedList = sortByOrder(originalList);
  let reorderMap = Map<string, number>(); // key: id, value: new order
  if (sourceOrder < destinationOrder) {
    // wants to go to later places
    sortedList.forEach((element) => {
      if (element.order === sourceOrder) {
        reorderMap = reorderMap.set(element.id, destinationOrder);
      } else if (element.order > sourceOrder && element.order <= destinationOrder) {
        reorderMap = reorderMap.set(element.id, element.order - 1);
      }
    });
  } else {
    // wants to go to earlier places
    sortedList.forEach((element) => {
      if (element.order === sourceOrder) {
        reorderMap = reorderMap.set(element.id, destinationOrder);
      } else if (element.order >= destinationOrder && element.order < sourceOrder) {
        reorderMap = reorderMap.set(element.id, element.order + 1);
      }
    });
  }
  for (let i = 0; i < sortedList.length; i += 1) {
    const element = sortedList[i];
    const newOrder = reorderMap.get(element.id);
    if (newOrder != null) {
      sortedList[i] = { ...element, order: newOrder };
    }
  }
  return { sortedList: sortByOrder(sortedList), reorderMap };
}
