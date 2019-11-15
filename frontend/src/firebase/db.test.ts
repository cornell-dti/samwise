import {
  db,
  orderManagerCollection,
  settingsCollection,
  bannerMessageStatusCollection,
  tagsCollection,
  tasksCollection,
  subTasksCollection,
} from './db';

it('db functions are lazy', () => {
  expect(typeof db).toBe('function');
  expect(typeof orderManagerCollection).toBe('function');
  expect(typeof settingsCollection).toBe('function');
  expect(typeof bannerMessageStatusCollection).toBe('function');
  expect(typeof tagsCollection).toBe('function');
  expect(typeof tasksCollection).toBe('function');
  expect(typeof subTasksCollection).toBe('function');
});
