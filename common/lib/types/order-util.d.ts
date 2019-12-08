import { Map } from 'immutable';
/**
 * @param list the list to sort.
 * @returns the sorted list in increasing order.
 */
export declare function sortByOrder<T extends {
    readonly order: number;
}>(list: T[]): T[];
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
export declare function computeReorderMap<T extends {
    readonly id: string;
    readonly order: number;
}>(originalList: T[], sourceOrder: number, destinationOrder: number): Map<string, number>;
/**
 * Apply the reorder map to an order list to obtained the sorted list.
 * The contract of the sorted list is described in the reorder function below.
 *
 * @param originalList the original list as a reference.
 * @param reorderMap the reorder map to apply.
 * @returns a new list with updated orders and the reordering map that maps id to new order.
 */
export declare function getReorderedList<T extends {
    readonly id: string;
    readonly order: number;
}>(originalList: T[], reorderMap: Map<string, number>): T[];
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
export declare function reorder<T extends {
    readonly id: string;
    readonly order: number;
}>(originalList: T[], sourceOrder: number, destinationOrder: number): T[];
