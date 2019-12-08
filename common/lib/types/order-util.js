import { Map } from 'immutable';
/**
 * Test whether the given list is sorted by increasing order.
 *
 * @param list the list to test whether things are sorted.
 */
function testSorted(list) {
    for (let i = 0; i < list.length - 1; i += 1) {
        const item = list[i];
        const next = list[i + 1];
        if (item.order > next.order) {
            throw new Error('Not sorted!');
        }
    }
}
/**
 * @param list the list to sort.
 * @returns the sorted list in increasing order.
 */
export function sortByOrder(list) {
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
export function computeReorderMap(originalList, sourceOrder, destinationOrder) {
    if (sourceOrder === destinationOrder) {
        return Map.of();
    }
    testSorted(originalList);
    let reorderMap = Map(); // key: id, value: new order
    if (sourceOrder < destinationOrder) {
        // wants to go to later places
        originalList.forEach((element) => {
            if (element.order === sourceOrder) {
                reorderMap = reorderMap.set(element.id, destinationOrder);
            }
            else if (element.order > sourceOrder && element.order <= destinationOrder) {
                reorderMap = reorderMap.set(element.id, element.order - 1);
            }
        });
    }
    else {
        // wants to go to earlier places
        originalList.forEach((element) => {
            if (element.order === sourceOrder) {
                reorderMap = reorderMap.set(element.id, destinationOrder);
            }
            else if (element.order >= destinationOrder && element.order < sourceOrder) {
                reorderMap = reorderMap.set(element.id, element.order + 1);
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
export function getReorderedList(originalList, reorderMap) {
    const sortedList = [...originalList];
    for (let i = 0; i < sortedList.length; i += 1) {
        const element = sortedList[i];
        const newOrder = reorderMap.get(element.id);
        if (newOrder != null) {
            sortedList[i] = Object.assign(Object.assign({}, element), { order: newOrder });
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
export function reorder(originalList, sourceOrder, destinationOrder) {
    const reorderMap = computeReorderMap(originalList, sourceOrder, destinationOrder);
    return getReorderedList(originalList, reorderMap);
}
