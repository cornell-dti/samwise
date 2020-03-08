import database from './db';

export default async (): Promise<void> => {
  const tasks = await database.tasksCollection().get();
  const taskIdOrders = tasks.docs.map((d) => {
    const { id, order } = d;
    return { id, order };
  });
  const batch = database.db().batch();
  taskIdOrders.forEach(({ id, order }) => {
    batch.update(database.tasksCollection().doc(id), { futureViewOrder: order });
  });
  batch.commit();
};
