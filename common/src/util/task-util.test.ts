import { Map, Set } from 'immutable';
import { Task, SubTask, TaskWithSubTasks } from '../types/store-types';
import {
  getFilteredCompletedInFocusTask,
  getFilteredNotCompletedInFocusTask,
  computeTaskProgress,
  TasksProgressProps,
} from './task-util';

// unimportant common attributes.
const order = 0;
const name = 'name';
type MainTaskTestCommon = {
  readonly type: 'ONE_TIME';
  readonly icalUID?: string;
  readonly id: string;
  readonly order: number;
  readonly name: string;
  readonly tag: string;
  readonly date: Date;
};
const testTaskCommon: MainTaskTestCommon = {
  type: 'ONE_TIME',
  id: 'random-id',
  order,
  name,
  tag: 'TAG',
  date: new Date(),
};

const exampleTasks: Task[] = [
  { ...testTaskCommon, inFocus: true, complete: true, children: Set.of('s1', 's2', 's3', 's4') },
  { ...testTaskCommon, inFocus: true, complete: false, children: Set.of('s1', 's2', 's3', 's4') },
  { ...testTaskCommon, inFocus: false, complete: true, children: Set.of('s1', 's2', 's3', 's4') },
  { ...testTaskCommon, inFocus: false, complete: false, children: Set.of('s1', 's2', 's3', 's4') },
  { ...testTaskCommon, inFocus: true, complete: true, children: Set.of() },
  { ...testTaskCommon, inFocus: true, complete: false, children: Set.of() },
  { ...testTaskCommon, inFocus: false, complete: true, children: Set.of() },
  { ...testTaskCommon, inFocus: false, complete: false, children: Set.of() },
];
const exampleSubTasks: SubTask[] = [
  { id: 's1', order, name, complete: true, inFocus: true },
  { id: 's2', order, name, complete: true, inFocus: false },
  { id: 's3', order, name, complete: false, inFocus: true },
  { id: 's4', order, name, complete: false, inFocus: false },
];
const [s1, s2, s3, s4] = exampleSubTasks;
const commonSubTaskMap: Map<string, SubTask> = Map.of().withMutations((m: Map<string, SubTask>) => {
  exampleSubTasks.forEach((s) => m.set(s.id, s));
});

type FilterResult = TaskWithSubTasks | null;
it('getFilteredCompletedInFocusTask works', () => {
  const expectedResults: FilterResult[] = [
    { ...testTaskCommon, inFocus: true, complete: true, subTasks: exampleSubTasks },
    { ...testTaskCommon, inFocus: true, complete: false, subTasks: [s1, s2] },
    { ...testTaskCommon, inFocus: false, complete: true, subTasks: [s1, s3] },
    { ...testTaskCommon, inFocus: false, complete: false, subTasks: [s1] },
    { ...testTaskCommon, inFocus: true, complete: true, subTasks: [] },
    null,
    null,
    null,
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
    null,
    { ...testTaskCommon, inFocus: true, complete: false, subTasks: [] },
    null,
    null,
  ];
  exampleTasks.forEach((t, i) => {
    expect(getFilteredNotCompletedInFocusTask(t, commonSubTaskMap)).toEqual(expectedResults[i]);
  });
});

it('getFiltered(Completed|NotCompleted)InFocusTask are complementary', () => {
  exampleTasks.forEach((task) => {
    const completedResult = getFilteredCompletedInFocusTask(task, commonSubTaskMap);
    const uncompletedResult = getFilteredNotCompletedInFocusTask(task, commonSubTaskMap);
    const allSubTasks: SubTask[] = [];
    if (completedResult) {
      allSubTasks.push(...completedResult.subTasks);
    }
    if (uncompletedResult) {
      allSubTasks.push(...uncompletedResult.subTasks);
    }
    // ensure disjoint union property
    const subTaskIdSet = allSubTasks.reduce(
      (acc: Set<string>, s: SubTask) => acc.add(s.id),
      Set.of(),
    );
    if (subTaskIdSet.size !== allSubTasks.length) {
      const { complete, inFocus, children } = task;
      let errorMessage = 'The subtasks in completed and uncompleted are not disjoint union.';
      errorMessage += ` Task: { complete: ${complete}, inFocus: ${inFocus}, chilren: ${children} }.`;
      errorMessage += ` Id Set: ${subTaskIdSet.toJS()}.`;
      errorMessage += ` SubTasks: ${allSubTasks.map((s) => s.id)}`;
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
    { completedTasksCount: 0, allTasksCount: 0 },
  );
  exampleTasks.forEach((t, i) => {
    expect(computeTaskProgress([t], commonSubTaskMap)).toEqual(expectedResults[i]);
  });
  expect(computeTaskProgress(exampleTasks, commonSubTaskMap)).toEqual(expectedTotal);
});
