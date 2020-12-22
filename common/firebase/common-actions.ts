import { FirestoreTag, FirestoreTask } from '../types/firestore-types';
import {
  PartialTaskMainData,
  RepeatingTaskMetadata,
  State,
  SubTask,
  Tag,
  Task,
  TaskMetadata,
} from '../types/store-types';
import Database, { WriteBatch } from './database';
import OrderManager from './order-manager';
import { error, ignore } from '../util/general-util';
import { NONE_TAG_ID } from '../util/tag-util';

type WithoutIdOrder<Props> = Pick<Props, Exclude<keyof Props, 'id' | 'order'>>;
type WithoutId<Props> = Pick<Props, Exclude<keyof Props, 'id'>>;
export type TaskWithoutIdOrderChildren<M = TaskMetadata> = Omit<
  Task<M>,
  'id' | 'order' | 'children'
>;

export type TaskWithoutIdOrder<M = TaskMetadata> = Omit<Task<M>, 'id' | 'order'>;

type EditType = 'EDITING_MASTER_TEMPLATE' | 'EDITING_ONE_TIME_TASK';

type Diff = { readonly mainTaskEdits: PartialTaskMainData };

export default class Actions {
  readonly orderManager: OrderManager;

  constructor(private readonly getUserEmail: () => string, private readonly database: Database) {
    this.orderManager = new OrderManager(database, getUserEmail);
  }

  private createFirestoreTag = async <T>(
    source: T
  ): Promise<T & { owner: string; order: number }> => {
    const order = await this.orderManager.allocateNewOrder('tags');
    return { ...source, owner: this.getUserEmail(), order };
  };

  private createFirestoreTask = async <T>(
    source: T,
    owner: readonly string[]
  ): Promise<T & { owner: readonly string[]; order: number }> => {
    const order = await this.orderManager.allocateNewOrder('tasks');
    return { ...source, owner, order };
  };

  /*
   * --------------------------------------------------------------------------------
   * Section 1: Tags Actions
   * --------------------------------------------------------------------------------
   */

  addTag = async (tag: WithoutIdOrder<Tag>): Promise<void> => {
    const firebaseTag: FirestoreTag = await this.createFirestoreTag(tag);
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
        s.docs.forEach((doc) => {
          batch.update(this.database.tasksCollection().doc(doc.id), { tag: NONE_TAG_ID });
        });
        batch.delete(this.database.tagsCollection().doc(id));
        batch.commit().then(ignore);
      });
  };

  private asyncAddTask = async (
    newTaskId: string,
    owner: readonly string[],
    task: TaskWithoutIdOrderChildren,
    subTasks: readonly SubTask[],
    batch: WriteBatch
  ): Promise<FirestoreTask> => {
    const baseTask = await this.createFirestoreTask({}, owner);
    const { metadata, ...rest } = task;
    rest.owner = baseTask.owner as readonly string[];
    const firestoreTask: FirestoreTask = { ...baseTask, ...rest, ...metadata, children: subTasks };
    batch.set(this.database.tasksCollection().doc(newTaskId), firestoreTask);
    return firestoreTask;
  };

  addTask = async (
    owner: readonly string[],
    task: TaskWithoutIdOrderChildren,
    subTasks: WithoutId<SubTask>[]
  ): Promise<void> => {
    const taskOwner = [''].toString() === owner.toString() ? [this.getUserEmail()] : owner;
    const newTaskId = this.database.tasksCollection().doc().id;
    const batch = this.database.db().batch();
    await this.asyncAddTask(newTaskId, taskOwner, task, subTasks, batch);
    await batch.commit();
  };

  removeAllForks = async (storeState: State, taskId: string): Promise<void> => {
    const { tasks } = storeState;
    const task = tasks.get(taskId) ?? error('bad!');
    const repeatingTask = task as Task<RepeatingTaskMetadata>;
    const forkIds = repeatingTask.metadata.forks.map((fork) => fork.forkId);
    const batch = this.database.db().batch();
    forkIds.forEach((id) => {
      if (id !== null) {
        batch.delete(this.database.tasksCollection().doc(id));
      }
    });
    // clear the forked array
    batch.update(this.database.tasksCollection().doc(taskId), { forks: [] });
    await batch.commit();
  };

  handleTaskDiffs = async (taskId: string, { mainTaskEdits }: Diff): Promise<void> => {
    const batch = this.database.db().batch();
    batch.update(this.database.tasksCollection().doc(taskId), mainTaskEdits);
    await batch.commit();
  };

  editTaskWithDiff = (
    storeState: State,
    taskId: string,
    editType: EditType,
    { mainTaskEdits }: Diff
  ): void => {
    (async () => {
      if (editType === 'EDITING_MASTER_TEMPLATE') {
        await this.removeAllForks(storeState, taskId);
      }
      this.handleTaskDiffs(taskId, { mainTaskEdits });
    })();
  };

  forkTaskWithDiff = (
    storeState: State,
    taskId: string,
    replaceDate: Date,
    { mainTaskEdits }: Diff
  ): void => {
    const { tasks } = storeState;
    const repeatingTaskMaster = tasks.get(taskId) as Task<RepeatingTaskMetadata>;
    const { id, order, children, metadata, ...originalTaskWithoutId } = repeatingTaskMaster;
    const newMainTask: TaskWithoutIdOrder = {
      ...originalTaskWithoutId,
      children,
      ...mainTaskEdits,
      metadata: {
        type: 'ONE_TIME',
        date: replaceDate,
      },
    };

    const batch = this.database.db().batch();
    const forkId = this.database.tasksCollection().doc().id;
    const owner = [this.getUserEmail()];
    this.asyncAddTask(forkId, owner, newMainTask, newMainTask.children, batch).then(() => {
      batch.update(this.database.tasksCollection().doc(id), {
        forks: [...repeatingTaskMaster.metadata.forks, { forkId, replaceDate }],
      });
      batch.commit();
    });
  };

  removeTask = async (storeState: State, task: Task): Promise<void> => {
    const { tasks, repeatedTaskSet } = storeState;
    const batch = this.database.db().batch();
    batch.delete(this.database.tasksCollection().doc(task.id));
    if (task.metadata.type === 'ONE_TIME' || task.metadata.type === 'GROUP') {
      // remove fork mentions
      repeatedTaskSet.forEach((repeatedTaskId) => {
        const repeatedTask = tasks.get(repeatedTaskId) as Task<RepeatingTaskMetadata> | null;
        if (repeatedTask == null) {
          return;
        }
        const oldForks = repeatedTask.metadata.forks;
        let needUpdateFork = false;
        const newForks = [];
        for (let i = 0; i < oldForks.length; i += 1) {
          const fork = oldForks[i];
          if (fork.forkId === task.id) {
            needUpdateFork = true;
            newForks.push({ forkId: null, replaceDate: fork.replaceDate });
          } else {
            newForks.push(fork);
          }
        }
        if (needUpdateFork) {
          batch.update(this.database.tasksCollection().doc(repeatedTaskId), { forks: newForks });
        }
      });
    } else {
      // also delete all forks
      task.metadata.forks.forEach((fork) => {
        const { forkId } = fork;
        if (forkId == null) {
          return;
        }
        batch.delete(this.database.tasksCollection().doc(forkId));
      });
    }
    await batch.commit();
  };

  removeOneRepeatedTask = ({ tasks }: State, taskId: string, replaceDate: Date): void => {
    const repeatingTaskMaster = tasks.get(taskId) as Task<RepeatingTaskMetadata>;
    this.database
      .tasksCollection()
      .doc(taskId)
      .update({ forks: [...repeatingTaskMaster.metadata.forks, { forkId: null, replaceDate }] });
  };

  editMainTask = (
    storeState: State,
    taskId: string,
    replaceDate: Date | null,
    mainTaskEdits: PartialTaskMainData
  ): void => {
    const diff: Diff = { mainTaskEdits };
    if (replaceDate === null) {
      this.editTaskWithDiff(storeState, taskId, 'EDITING_ONE_TIME_TASK', diff);
    } else {
      const dateEdit = mainTaskEdits.date != null ? mainTaskEdits.date : replaceDate;
      const newDiff = { ...diff, mainTaskEdits: { ...diff.mainTaskEdits, date: dateEdit } };
      this.forkTaskWithDiff(storeState, taskId, replaceDate, newDiff);
    }
  };
}
