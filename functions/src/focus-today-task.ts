import { db, tasksCollection } from './db';

export default async (): Promise<void> => {
  const todayAtZero = new Date();
  todayAtZero.setHours(0, 0, 0, 0);
  const todayAt235959 = new Date();
  todayAt235959.setHours(23, 59, 59, 0);
  const tasks = await tasksCollection()
    .where('date', '>=', todayAtZero)
    .where('date', '<', todayAt235959)
    .get();
  const taskIdList = tasks.docs.map((document) => document.id);
  const batch = db().batch();
  taskIdList.forEach((id) => {
    batch.update(tasksCollection().doc(id), { inFocus: true });
  });
  batch.commit();
};
