import { Task, SubTask } from '../types/store-types';
import {
  getFilteredCompletedInFocusTask,
  getFilteredNotCompletedInFocusTask,
  computeTaskProgress,
  TasksProgressProps,
  subTasksEqual,
  sortTask,
} from './task-util';

// unimportant common attributes.
const order = 0;
const name = 'name';
type MainTaskTestCommon = {
  readonly id: string;
  readonly order: number;
  readonly owner: readonly string[];
  readonly name: string;
  readonly tag: string;
  readonly metadata: {
    readonly type: 'ONE_TIME';
    readonly icalUID?: string;
    readonly date: Date;
  };
};
const testTaskCommon: MainTaskTestCommon = {
  id: 'random-id',
  order,
  owner: ['user'],
  name,
  tag: 'TAG',
  metadata: {
    type: 'ONE_TIME',
    date: new Date(),
  },
};

const s1: SubTask = { order, name, complete: true, inFocus: true };
const s2: SubTask = { order, name, complete: true, inFocus: false };
const s3: SubTask = { order, name, complete: false, inFocus: true };
const s4: SubTask = { order, name, complete: false, inFocus: false };
const exampleTasks: Task[] = [
  { ...testTaskCommon, inFocus: true, complete: true, children: [s1, s2, s3, s4] },
  { ...testTaskCommon, inFocus: true, complete: false, children: [s1, s2, s3, s4] },
  { ...testTaskCommon, inFocus: false, complete: true, children: [s1, s2, s3, s4] },
  { ...testTaskCommon, inFocus: false, complete: false, children: [s1, s2, s3, s4] },
  { ...testTaskCommon, inFocus: true, complete: true, children: [] },
  { ...testTaskCommon, inFocus: true, complete: false, children: [] },
  { ...testTaskCommon, inFocus: false, complete: true, children: [] },
  { ...testTaskCommon, inFocus: false, complete: false, children: [] },
];
const exampleSubTasks: SubTask[] = [s1, s2, s3, s4];

type FilterResult = Task | null;
it('getFilteredCompletedInFocusTask works', () => {
  const expectedResults: FilterResult[] = [
    { ...testTaskCommon, inFocus: true, complete: true, children: exampleSubTasks },
    { ...testTaskCommon, inFocus: true, complete: false, children: [s1, s2] },
    { ...testTaskCommon, inFocus: false, complete: true, children: [s1, s3] },
    { ...testTaskCommon, inFocus: false, complete: false, children: [s1] },
    { ...testTaskCommon, inFocus: true, complete: true, children: [] },
    null,
    null,
    null,
  ];
  exampleTasks.forEach((t, i) => {
    expect(getFilteredCompletedInFocusTask(t)).toEqual(expectedResults[i]);
  });
});

it('getFilteredNotCompletedInFocusTask works', () => {
  const expectedResults: FilterResult[] = [
    null,
    { ...testTaskCommon, inFocus: true, complete: false, children: [s3, s4] },
    null,
    { ...testTaskCommon, inFocus: false, complete: false, children: [s3] },
    null,
    { ...testTaskCommon, inFocus: true, complete: false, children: [] },
    null,
    null,
  ];
  exampleTasks.forEach((t, i) => {
    expect(getFilteredNotCompletedInFocusTask(t)).toEqual(expectedResults[i]);
  });
});

it('getFiltered(Completed|NotCompleted)InFocusTask are complementary', () => {
  exampleTasks.forEach((task) => {
    const completedResult = getFilteredCompletedInFocusTask(task);
    const uncompletedResult = getFilteredNotCompletedInFocusTask(task);
    const allSubTasks: SubTask[] = [];
    if (completedResult) {
      allSubTasks.push(...completedResult.children);
    }
    if (uncompletedResult) {
      allSubTasks.push(...uncompletedResult.children);
    }

    // ensure disjoint union property
    const subTaskSet = allSubTasks.filter((sub) =>
      allSubTasks.reduce((acc: boolean, curr: SubTask) => subTasksEqual(sub, curr) || acc, false)
    );
    if (subTaskSet.length !== allSubTasks.length) {
      const { complete, inFocus, children } = task;
      let errorMessage = 'The subtasks in completed and uncompleted are not disjoint union.';
      errorMessage += ` Task: { complete: ${complete}, inFocus: ${inFocus}, children: ${JSON.stringify(
        children
      )} }.`;
      throw new Error(errorMessage);
    }
    // ensure allSubTasks are all in focus.
    allSubTasks.forEach((subTask) => expect(task.inFocus || subTask.inFocus).toBe(true));
  });
});

it('computeTaskProgress works', () => {
  const expectedResults: TasksProgressProps[] = [
    { completedTasksCount: 5, allTasksCount: 5 },
    { completedTasksCount: 2, allTasksCount: 5 },
    { completedTasksCount: 2, allTasksCount: 2 },
    { completedTasksCount: 1, allTasksCount: 2 },
    { completedTasksCount: 1, allTasksCount: 1 },
    { completedTasksCount: 0, allTasksCount: 1 },
    { completedTasksCount: 0, allTasksCount: 0 },
    { completedTasksCount: 0, allTasksCount: 0 },
  ];
  const expectedTotal = expectedResults.reduce(
    (acc, curr) => ({
      completedTasksCount: acc.completedTasksCount + curr.completedTasksCount,
      allTasksCount: acc.allTasksCount + curr.allTasksCount,
    }),
    { completedTasksCount: 0, allTasksCount: 0 }
  );
  exampleTasks.forEach((t, i) => {
    expect(computeTaskProgress([t])).toEqual(expectedResults[i]);
  });
  expect(computeTaskProgress(exampleTasks)).toEqual(expectedTotal);
});

it('subTaskEqual works', () => {
  const subTask1: SubTask = {
    order: 0,
    name: 'foo',
    complete: false,
    inFocus: true,
  };
  const subTask1Duplicate: SubTask = { ...subTask1 };
  const subTask1AlteredName: SubTask = { ...subTask1, name: 'baz' };
  expect(subTask1).toEqual(subTask1Duplicate);
  expect(subTasksEqual(subTask1, subTask1Duplicate)).toBeTruthy();
  expect(subTasksEqual(subTask1, subTask1AlteredName)).toBeFalsy();
});

it('sortTask works', () => {
  const groupTask1FromGroup1: Task = {
    id: '1',
    order: 1,
    name: '',
    tag: '',
    owner: [],
    inFocus: true,
    complete: true,
    children: [],
    metadata: { type: 'GROUP', group: 'g1', date: new Date() },
  };
  const groupTask2FromGroup1: Task = {
    id: '2',
    order: 2,
    name: '',
    tag: '',
    owner: [],
    inFocus: true,
    complete: true,
    children: [],
    metadata: { type: 'GROUP', group: 'g1', date: new Date() },
  };
  const groupTask1FromGroup2: Task = {
    id: '3',
    order: 1,
    name: '',
    tag: '',
    owner: [],
    inFocus: true,
    complete: true,
    children: [],
    metadata: { type: 'GROUP', group: 'g2', date: new Date() },
  };
  const groupTask2FromGroup2: Task = {
    id: '4',
    order: 2,
    name: '',
    tag: '',
    owner: [],
    inFocus: true,
    complete: true,
    children: [],
    metadata: { type: 'GROUP', group: 'g2', date: new Date() },
  };
  const repeatingTask1: Task = {
    id: '5',
    order: 1,
    name: '',
    tag: '',
    owner: [],
    inFocus: true,
    complete: true,
    children: [],
    metadata: {
      type: 'MASTER_TEMPLATE',
      date: {
        startDate: new Date(),
        endDate: new Date(),
        pattern: { type: 'BIWEEKLY', bitSet: 1 },
      },
      forks: [],
    },
  };
  const repeatingTask2: Task = {
    id: '6',
    order: 2,
    name: '',
    tag: '',
    owner: [],
    inFocus: true,
    complete: true,
    children: [],
    metadata: {
      type: 'MASTER_TEMPLATE',
      date: {
        startDate: new Date(),
        endDate: new Date(),
        pattern: { type: 'BIWEEKLY', bitSet: 1 },
      },
      forks: [],
    },
  };
  const oneTimeTask1: Task = {
    id: '7',
    order: 1,
    name: '',
    tag: '',
    owner: [],
    inFocus: true,
    complete: true,
    children: [],
    metadata: { type: 'ONE_TIME', date: new Date() },
  };
  const oneTimeTask2: Task = {
    id: '8',
    order: 2,
    name: '',
    tag: '',
    owner: [],
    inFocus: true,
    complete: true,
    children: [],
    metadata: { type: 'ONE_TIME', date: new Date() },
  };

  expect(
    [
      groupTask1FromGroup2,
      oneTimeTask1,
      repeatingTask2,
      repeatingTask1,
      oneTimeTask2,
      groupTask1FromGroup1,
      groupTask2FromGroup2,
      groupTask2FromGroup1,
    ].sort(sortTask)
  ).toEqual([
    groupTask1FromGroup1,
    groupTask2FromGroup1,
    groupTask1FromGroup2,
    groupTask2FromGroup2,
    repeatingTask1,
    repeatingTask2,
    oneTimeTask1,
    oneTimeTask2,
  ]);
});
