import { db, orderManagerCollection } from './db';
import { getAppUser } from './auth';

type DocRef = firebase.firestore.DocumentReference;
const managerRef = (): DocRef => orderManagerCollection().doc(getAppUser().email);

type Manager = {
  readonly tagsMaxOrder: number;
  readonly tasksMaxOrder: number;
};

type PartialManager = Partial<Manager>;

/**
 * Allocate a new order number of tags or tgs.
 *
 * @param {'tags' | 'tasks'} orderFor the order for tags or tasks.
 * @param {number} count the count allocated. Default to 1.
 * @return {Promise<number>} the promise of the order number.
 */
export default async function allocateNewOrder(
  orderFor: 'tags' | 'tasks', count = 1,
): Promise<number> {
  const ref = managerRef();
  const forTags = orderFor === 'tags';
  return db().runTransaction(async (transaction) => {
    const docInTransaction = await transaction.get(ref);
    if (!docInTransaction.exists) {
      const newManager: Manager = { tagsMaxOrder: count, tasksMaxOrder: count };
      transaction.set(ref, newManager);
      return 0;
    }
    const manager = docInTransaction.data();
    if (manager === undefined) {
      throw new Error('Impossible!');
    }
    const newOrder: number = forTags ? manager.tagsMaxOrder : manager.tasksMaxOrder;
    const update: PartialManager = forTags
      ? { tagsMaxOrder: newOrder + count }
      : { tasksMaxOrder: newOrder + count };
    transaction.update(ref, update);
    return newOrder;
  });
}
