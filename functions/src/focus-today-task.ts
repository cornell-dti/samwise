import { FirestoreMasterTask } from 'common/types/firestore-types';
import { RepeatingTaskMetadata, Task } from 'common/types/store-types';
import Actions from 'common/firebase/common-actions';
import { dateMatchRepeats } from 'common/util/task-util';
import database from './db';

const focusOneTimeTasksThatAreDueToday = async (): Promise<void> => {
  const todayAtZero = new Date();
  todayAtZero.setHours(0, 0, 0, 0);
  const todayAt235959 = new Date();
  todayAt235959.setHours(23, 59, 59, 0);
  const tasks = await database
    .tasksCollection()
    .where('date', '>=', todayAtZero)
    .where('date', '<', todayAt235959)
    .get();
  const taskIdList = tasks.docs.map((document) => document.id);
  const batch = database.db().batch();
  taskIdList.forEach((id) => {
    batch.update(database.tasksCollection().doc(id), { inFocus: true });
  });
  batch.commit();
};

const focusRepeatingTasksThatAreDueToday = async (): Promise<void> => {
  const todayAtZero = new Date();
  todayAtZero.setHours(0, 0, 0, 0);
  const querySnapsot = await database
    .tasksCollection()
    .where('type', '==', 'MASTER_TEMPLATE')
    .get();
  await Promise.all(
    querySnapsot.docs.map(async (snapshot) => {
      const {
        date: { startDate, endDate, pattern },
        forks,
        type,
        ...rest
      } = snapshot.data() as FirestoreMasterTask;
      const repeatingTask: Task<RepeatingTaskMetadata> = {
        id: snapshot.id,
        ...rest,
        metadata: {
          type: 'MASTER_TEMPLATE',
          date: {
            startDate: startDate instanceof Date ? startDate : startDate.toDate(),
            endDate:
              typeof endDate === 'number' || endDate instanceof Date ? endDate : endDate.toDate(),
            pattern,
          },
          forks: forks.map(({ replaceDate, forkId }) => ({
            replaceDate: replaceDate instanceof Date ? replaceDate : replaceDate.toDate(),
            forkId,
          })),
        },
      };
      if (dateMatchRepeats(todayAtZero, repeatingTask.metadata)) {
        const actions = new Actions(
          () => repeatingTask.owner[0],
          () => {
            throw new Error('getUserDisplayName will not be called');
          },
          database
        );
        await actions.forkTaskWithDiff(repeatingTask, todayAtZero, {
          mainTaskEdits: { inFocus: true },
        });
      }
    })
  );
};

const focusTasksThatAreDueToday = async (): Promise<void> => {
  await Promise.all([focusOneTimeTasksThatAreDueToday(), focusRepeatingTasksThatAreDueToday()]);
};

export default focusTasksThatAreDueToday;
