import { Map, Set } from 'immutable';
import { getFilteredCompletedInFocusTask, getFilteredNotCompletedInFocusTask, computeTaskProgress, } from './task-util';
// unimportant common attributes.
const order = 0;
const name = 'name';
const testTaskCommon = {
    type: 'ONE_TIME',
    id: 'random-id',
    order,
    name,
    tag: 'TAG',
    date: new Date(),
};
const exampleTasks = [
    Object.assign(Object.assign({}, testTaskCommon), { inFocus: true, complete: true, children: Set.of('s1', 's2', 's3', 's4') }),
    Object.assign(Object.assign({}, testTaskCommon), { inFocus: true, complete: false, children: Set.of('s1', 's2', 's3', 's4') }),
    Object.assign(Object.assign({}, testTaskCommon), { inFocus: false, complete: true, children: Set.of('s1', 's2', 's3', 's4') }),
    Object.assign(Object.assign({}, testTaskCommon), { inFocus: false, complete: false, children: Set.of('s1', 's2', 's3', 's4') }),
    Object.assign(Object.assign({}, testTaskCommon), { inFocus: true, complete: true, children: Set.of() }),
    Object.assign(Object.assign({}, testTaskCommon), { inFocus: true, complete: false, children: Set.of() }),
    Object.assign(Object.assign({}, testTaskCommon), { inFocus: false, complete: true, children: Set.of() }),
    Object.assign(Object.assign({}, testTaskCommon), { inFocus: false, complete: false, children: Set.of() }),
];
const exampleSubTasks = [
    { id: 's1', order, name, complete: true, inFocus: true },
    { id: 's2', order, name, complete: true, inFocus: false },
    { id: 's3', order, name, complete: false, inFocus: true },
    { id: 's4', order, name, complete: false, inFocus: false },
];
const [s1, s2, s3, s4] = exampleSubTasks;
const commonSubTaskMap = Map.of().withMutations((m) => {
    exampleSubTasks.forEach((s) => m.set(s.id, s));
});
it('getFilteredCompletedInFocusTask works', () => {
    const expectedResults = [
        Object.assign(Object.assign({}, testTaskCommon), { inFocus: true, complete: true, subTasks: exampleSubTasks }),
        Object.assign(Object.assign({}, testTaskCommon), { inFocus: true, complete: false, subTasks: [s1, s2] }),
        Object.assign(Object.assign({}, testTaskCommon), { inFocus: false, complete: true, subTasks: [s1, s3] }),
        Object.assign(Object.assign({}, testTaskCommon), { inFocus: false, complete: false, subTasks: [s1] }),
        Object.assign(Object.assign({}, testTaskCommon), { inFocus: true, complete: true, subTasks: [] }),
        null,
        null,
        null,
    ];
    exampleTasks.forEach((t, i) => {
        expect(getFilteredCompletedInFocusTask(t, commonSubTaskMap)).toEqual(expectedResults[i]);
    });
});
it('getFilteredNotCompletedInFocusTask works', () => {
    const expectedResults = [
        null,
        Object.assign(Object.assign({}, testTaskCommon), { inFocus: true, complete: false, subTasks: [s3, s4] }),
        null,
        Object.assign(Object.assign({}, testTaskCommon), { inFocus: false, complete: false, subTasks: [s3] }),
        null,
        Object.assign(Object.assign({}, testTaskCommon), { inFocus: true, complete: false, subTasks: [] }),
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
        const allSubTasks = [];
        if (completedResult) {
            allSubTasks.push(...completedResult.subTasks);
        }
        if (uncompletedResult) {
            allSubTasks.push(...uncompletedResult.subTasks);
        }
        // ensure disjoint union property
        const subTaskIdSet = allSubTasks.reduce((acc, s) => acc.add(s.id), Set.of());
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
    const expectedResults = [
        { completedTasksCount: 5, allTasksCount: 5 },
        { completedTasksCount: 2, allTasksCount: 5 },
        { completedTasksCount: 2, allTasksCount: 2 },
        { completedTasksCount: 1, allTasksCount: 2 },
        { completedTasksCount: 1, allTasksCount: 1 },
        { completedTasksCount: 0, allTasksCount: 1 },
        { completedTasksCount: 0, allTasksCount: 0 },
        { completedTasksCount: 0, allTasksCount: 0 },
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
