import { Map, Set } from 'immutable';
import {
  getFilteredCompletedInFocusTask,
  getFilteredNotCompletedInFocusTask,
  computeTaskProgress,
  TasksProgressProps,
} from './task-util';
import { Task, SubTask } from '../store/store-types';
import { TaskWithSubTasks } from '../components/Util/TaskEditors/editors-types';

// unimportant common attributes.
const id = 'random-id';
const order = 0;
const name = 'name';
const tag = 'TAG';
const date = new Date();
const testTaskCommon = { id, order, name, tag, date };

const exampleTasks: Task[] = [
  { ...testTaskCommon, inFocus: true, complete: true, children: Set.of('s1', 's2', 's3', 's4') },
  { ...testTaskCommon, inFocus: true, complete: false, children: Set.of('s1', 's2', 's3', 's4') },
  { ...testTaskCommon, inFocus: false, complete: true, children: Set.of('s1', 's2', 's3', 's4') },
  { ...testTaskCommon, inFocus: false, complete: false, children: Set.of('s1', 's2', 's3', 's4') },
];
const exampleSubTasks: SubTask[] = [
  { id: 's1', order, name, complete: true, inFocus: true },
  { id: 's2', order, name, complete: true, inFocus: false },
  { id: 's3', order, name, complete: false, inFocus: true },
  { id: 's4', order, name, complete: false, inFocus: false },
];
const [s1, s2, s3, s4] = exampleSubTasks;
const commonSubTaskMap: Map<string, SubTask> = Map.of().withMutations((m: Map<string, SubTask>) => {
  exampleSubTasks.forEach(s => m.set(s.id, s));
});

type FilterResult = TaskWithSubTasks | null;
it('getFilteredCompletedInFocusTask works', () => {
  const expectedResults: FilterResult[] = [
    { ...testTaskCommon, inFocus: true, complete: true, subTasks: exampleSubTasks },
    { ...testTaskCommon, inFocus: true, complete: false, subTasks: [s1, s2] },
    { ...testTaskCommon, inFocus: false, complete: true, subTasks: [s1, s3] },
    { ...testTaskCommon, inFocus: false, complete: false, subTasks: [s1] },
  ];
  exampleTasks.forEach((t, i) => {
    expect(getFilteredCompletedInFocusTask(t, commonSubTaskMap)).toEqual(expectedResults[i]);
  });
});

it('getFilteredNotCompletedInFocusTask works', () => {
  const expectedResults: FilterResult[] = [
    null,
    { ...testTaskCommon, inFocus: true, complete: false, subTasks: [s3, s4] },
    null,
    { ...testTaskCommon, inFocus: false, complete: false, subTasks: [s3] },
  ];
  exampleTasks.forEach((t, i) => {
    expect(getFilteredNotCompletedInFocusTask(t, commonSubTaskMap)).toEqual(expectedResults[i]);
  });
});

it('computeTaskProgress works', () => {
  const expectedResults: TasksProgressProps[] = [
    { completedTasksCount: 5, allTasksCount: 5 },
    { completedTasksCount: 2, allTasksCount: 5 },
    { completedTasksCount: 2, allTasksCount: 2 },
    { completedTasksCount: 1, allTasksCount: 2 },
  ];
  const expectedTotal = expectedResults.reduce((acc, curr) => ({
    completedTasksCount: acc.completedTasksCount + curr.completedTasksCount,
    allTasksCount: acc.allTasksCount + curr.allTasksCount,
  }), { completedTasksCount: 0, allTasksCount: 0 });
  exampleTasks.forEach((t, i) => {
    expect(computeTaskProgress([t], commonSubTaskMap)).toEqual(expectedResults[i]);
  });
  expect(computeTaskProgress(exampleTasks, commonSubTaskMap)).toEqual(expectedTotal);
});
