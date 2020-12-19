import Database from './database';

export type FirestoreOrderManager = {
  readonly tagsMaxOrder: number;
  readonly tasksMaxOrder: number;
};
type PartialManager = Partial<FirestoreOrderManager>;

export default class OrderManager {
  // eslint-disable-next-line no-useless-constructor
  constructor(private readonly database: Database, private readonly getUserEmail: () => string) {}

  /**
   * Allocate a new order number of tags or tgs.
   *
   * @param orderFor the order for tags or tasks.
   * @param count the count allocated. Default to 1.
   * @return the promise of the order number.
   */
  public allocateNewOrder = async (orderFor: 'tags' | 'tasks', count = 1): Promise<number> => {
    const ref = this.database.orderManagerCollection().doc(this.getUserEmail());
    const forTags = orderFor === 'tags';
    return this.database.db().runTransaction(async (transaction) => {
      const docInTransaction = await transaction.get(ref);
      if (!docInTransaction.exists) {
        const newManager: FirestoreOrderManager = { tagsMaxOrder: count, tasksMaxOrder: count };
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
  };
}
