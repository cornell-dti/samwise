import rootReducer from './reducers';
import { initialStateForTesting } from './state';

const date = new Date('2031-01-01');

it('reducer works: new task creation -> subtask creation', () => {
  const intermediateState1 = rootReducer(undefined, {
    type: 'PATCH_TASKS',
    created: [
      {
        id: '1',
        order: 4,
        owner: ['foo'],
        name: 'test',
        tag: 'foo',
        complete: true,
        inFocus: true,
        children: ['s1', 's2'],
        metadata: {
          type: 'ONE_TIME',
          date,
        },
      },
    ],
    edited: [],
    deleted: [],
  });
  expect(intermediateState1.tasks.get('1')?.children).toEqual([]);
  expect(Array.from(intermediateState1.missingSubTasks.entries())).toEqual([
    ['s1', '1'],
    ['s2', '1'],
  ]);
  expect(Array.from(intermediateState1.orphanSubTasks.entries())).toEqual([]);

  const intermediateState2 = rootReducer(intermediateState1, {
    type: 'PATCH_SUBTASKS',
    created: [{ id: 's1', order: 1, name: 'foo', complete: true, inFocus: false }],
    edited: [],
    deleted: [],
  });
  expect(intermediateState2.tasks.get('1')?.children).toEqual([
    { id: 's1', order: 1, name: 'foo', complete: true, inFocus: false },
  ]);
  expect(Array.from(intermediateState2.missingSubTasks.entries())).toEqual([['s2', '1']]);
  expect(Array.from(intermediateState2.orphanSubTasks.entries())).toEqual([]);

  const finalState = rootReducer(intermediateState2, {
    type: 'PATCH_SUBTASKS',
    created: [{ id: 's2', order: 2, name: 'bar', complete: true, inFocus: false }],
    edited: [],
    deleted: [],
  });
  expect(finalState.tasks.get('1')?.children).toEqual([
    { id: 's1', order: 1, name: 'foo', complete: true, inFocus: false },
    { id: 's2', order: 2, name: 'bar', complete: true, inFocus: false },
  ]);
  expect(Array.from(finalState.missingSubTasks.entries())).toEqual([]);
  expect(Array.from(finalState.orphanSubTasks.entries())).toEqual([]);
});

it('reducer works: subtask creation -> new task creation', () => {
  const intermediateState = rootReducer(undefined, {
    type: 'PATCH_SUBTASKS',
    created: [
      { id: 's2', order: 2, name: 'bar', complete: true, inFocus: false },
      { id: 's1', order: 1, name: 'foo', complete: true, inFocus: false },
    ],
    edited: [],
    deleted: [],
  });
  expect(Array.from(intermediateState.missingSubTasks.entries())).toEqual([]);
  expect(Array.from(intermediateState.orphanSubTasks.entries())).toEqual([
    ['s2', { id: 's2', order: 2, name: 'bar', complete: true, inFocus: false }],
    ['s1', { id: 's1', order: 1, name: 'foo', complete: true, inFocus: false }],
  ]);

  const finalState = rootReducer(intermediateState, {
    type: 'PATCH_TASKS',
    created: [
      {
        id: '1',
        order: 4,
        owner: ['foo'],
        name: 'test',
        tag: 'foo',
        complete: true,
        inFocus: true,
        children: ['s1', 's2'],
        metadata: {
          type: 'ONE_TIME',
          date,
        },
      },
    ],
    edited: [],
    deleted: [],
  });
  expect(finalState.tasks.get('1')?.children).toEqual([
    { id: 's1', order: 1, name: 'foo', complete: true, inFocus: false },
    { id: 's2', order: 2, name: 'bar', complete: true, inFocus: false },
  ]);
  expect(Array.from(finalState.missingSubTasks.entries())).toEqual([]);
  expect(Array.from(finalState.orphanSubTasks.entries())).toEqual([]);
});

it('reducer works, task edit -> subtask creation', () => {
  const intermediateState = rootReducer(initialStateForTesting, {
    type: 'PATCH_TASKS',
    created: [],
    edited: [
      {
        id: 'foo',
        order: 1,
        owner: ['foo'],
        name: 'Foo',
        tag: 'foo',
        complete: true,
        inFocus: false,
        children: ['foo', 'foo1'],
        metadata: {
          type: 'ONE_TIME',
          date,
        },
      },
    ],
    deleted: [],
  });
  expect(Array.from(intermediateState.missingSubTasks.entries())).toEqual([['foo1', 'foo']]);
  expect(Array.from(intermediateState.orphanSubTasks.entries())).toEqual([]);

  const finalState = rootReducer(intermediateState, {
    type: 'PATCH_SUBTASKS',
    created: [{ id: 'foo1', order: 0, name: 'Foo1', complete: true, inFocus: false }],
    edited: [{ id: 'foo', order: 1, name: 'Bar', complete: true, inFocus: false }],
    deleted: [],
  });
  expect(finalState.tasks.get('foo')?.children).toEqual([
    { id: 'foo1', order: 0, name: 'Foo1', complete: true, inFocus: false },
    { id: 'foo', order: 1, name: 'Bar', complete: true, inFocus: false },
  ]);
  expect(Array.from(finalState.missingSubTasks.entries())).toEqual([]);
  expect(Array.from(finalState.orphanSubTasks.entries())).toEqual([]);
});

it('reducer works, subtask creation -> task edit', () => {
  const intermediateState = rootReducer(initialStateForTesting, {
    type: 'PATCH_SUBTASKS',
    created: [{ id: 'foo1', order: 0, name: 'Foo1', complete: true, inFocus: false }],
    edited: [{ id: 'foo', order: 1, name: 'Bar', complete: true, inFocus: false }],
    deleted: [],
  });
  expect(Array.from(intermediateState.missingSubTasks.entries())).toEqual([]);
  expect(Array.from(intermediateState.orphanSubTasks.entries())).toEqual([
    ['foo1', { id: 'foo1', order: 0, name: 'Foo1', complete: true, inFocus: false }],
  ]);

  const finalState = rootReducer(intermediateState, {
    type: 'PATCH_TASKS',
    created: [],
    edited: [
      {
        id: 'foo',
        order: 1,
        owner: ['foo'],
        name: 'Foo',
        tag: 'foo',
        complete: true,
        inFocus: false,
        children: ['foo', 'foo1'],
        metadata: {
          type: 'ONE_TIME',
          date,
        },
      },
    ],
    deleted: [],
  });
  expect(finalState.tasks.get('foo')?.children).toEqual([
    { id: 'foo1', order: 0, name: 'Foo1', complete: true, inFocus: false },
    { id: 'foo', order: 1, name: 'Bar', complete: true, inFocus: false },
  ]);
  expect(Array.from(finalState.missingSubTasks.entries())).toEqual([]);
  expect(Array.from(finalState.orphanSubTasks.entries())).toEqual([]);
});
