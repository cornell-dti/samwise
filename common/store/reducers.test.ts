import { SubTask } from '../types/store-types';
import rootReducer from './reducers';
import { initialStateForTesting } from './state';

const date = new Date('2031-01-01');

const subTask1: SubTask = {
  order: 0,
  name: 'foo subtask',
  complete: false,
  inFocus: true,
};

const subTask2: SubTask = {
  order: 1,
  name: 'boo bubtask',
  complete: false,
  inFocus: false,
};

it('reducer works: new task creation with subtasks', () => {
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
        children: [subTask1, subTask2],
        metadata: {
          type: 'ONE_TIME',
          date,
        },
      },
    ],
    edited: [],
    deleted: [],
  });
  expect(intermediateState1.tasks.get('1')?.children).toEqual([subTask1, subTask2]);
});

it('reducer works, task edit to create subtask', () => {
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
        children: [subTask1, subTask2],
        metadata: {
          type: 'ONE_TIME',
          date,
        },
      },
    ],
    deleted: [],
  });

  const subTask2Edited: SubTask = {
    order: 1,
    name: 'bars',
    complete: true,
    inFocus: false,
  };

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
        children: [subTask1, subTask2Edited],
        metadata: {
          type: 'ONE_TIME',
          date,
        },
      },
    ],
    deleted: [],
  });

  expect(finalState.tasks.get('foo')?.children).toEqual([subTask1, subTask2Edited]);
});
