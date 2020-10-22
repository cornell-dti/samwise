import { FirestoreCommon, FirestoreTag } from '../types/firestore-types';
import { Tag } from '../types/store-types';
import Database from './database';
import OrderManager from './order-manager';
import { ignore } from '../util/general-util';
import { NONE_TAG_ID } from '../util/tag-util';

type WithoutIdOrder<Props> = Pick<Props, Exclude<keyof Props, 'id' | 'order'>>;

export default class Actions {
  readonly orderManager: OrderManager;

  constructor(private readonly getUserEmail: () => string, private readonly database: Database) {
    this.orderManager = new OrderManager(database, getUserEmail);
  }

  private createFirestoreObject = async <T>(
    orderFor: 'tags' | 'tasks',
    source: T
  ): Promise<T & FirestoreCommon> => {
    const order = await this.orderManager.allocateNewOrder(orderFor);
    return { ...source, owner: [this.getUserEmail()], order };
  };

  /*
   * --------------------------------------------------------------------------------
   * Section 1: Tags Actions
   * --------------------------------------------------------------------------------
   */

  addTag = async (tag: WithoutIdOrder<Tag>): Promise<void> => {
    const firebaseTag: FirestoreTag = await this.createFirestoreObject('tags', tag);
    await this.database.tagsCollection().add(firebaseTag);
  };

  editTag = async (tag: Tag): Promise<void> => {
    const { id, ...rest } = tag;
    await this.database.tagsCollection().doc(id).update(rest);
  };

  removeTag = async (id: string): Promise<void> => {
    await this.database
      .tasksCollection()
      .where('owner', 'array-contains', this.getUserEmail())
      .where('tag', '==', id)
      .get()
      .then((s) => {
        const batch = this.database.db().batch();
        s.docs
          .filter((doc) => doc.data().type === 'TASK')
          .forEach((doc) => {
            batch.update(this.database.tasksCollection().doc(doc.id), { tag: NONE_TAG_ID });
          });
        batch.delete(this.database.tagsCollection().doc(id));
        batch.commit().then(ignore);
      });
  };
}
