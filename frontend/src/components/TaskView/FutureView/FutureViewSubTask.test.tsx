import { Task, TaskMetadata } from 'common/types/store-types';
import React from 'react';
import renderer from 'react-test-renderer';
import FutureViewSubTask from './FutureViewSubTask';

const dummyTask: Task<TaskMetadata> = {
  id: 'foo',
  order: 1,
  owner: ['foo'],
  name: 'Foo',
  tag: 'foo',
  complete: true,
  inFocus: false,
  children: [{ order: 1, name: 'Foo', complete: true, inFocus: false }],
  metadata: {
    type: 'ONE_TIME',
    date: new Date('2030-01-01'),
  },
};

it('FutureViewSubTask with null SubTask matches snapshot.', () => {
  const tree = renderer
    .create(
      <FutureViewSubTask
        taskData={dummyTask}
        subTask={null}
        mainTaskCompleted
        replaceDateForFork={null}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

const createTest = (inFocus: boolean, complete: boolean, mainTaskCompleted: boolean): void => {
  const testName = `FutureViewSubTask(${inFocus}, ${complete}, ${mainTaskCompleted}) matches snapshot`;
  it(testName, () => {
    const tree = renderer
      .create(
        <FutureViewSubTask
          taskData={dummyTask}
          subTask={{ order: 1, name: 'foo', inFocus, complete }}
          mainTaskCompleted={mainTaskCompleted}
          replaceDateForFork={null}
        />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
};

createTest(false, false, false);
createTest(false, false, true);
createTest(false, true, false);
createTest(false, true, true);
createTest(true, false, false);
createTest(true, false, true);
createTest(true, true, false);
createTest(true, true, true);
