import React from 'react';
import renderer from 'react-test-renderer';
import FutureViewSubTask from './FutureViewSubTask';

it('FutureViewSubTask with null SubTask matches snapshot.', () => {
  const tree = renderer.create(
    <FutureViewSubTask
      mainTaskId="foo"
      subTask={null}
      replaceDateForFork={null}
      mainTaskCompleted
    />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

const createTest = (inFocus: boolean, complete: boolean, mainTaskCompleted: boolean): void => {
  const testName = `FutureViewSubTask(${inFocus}, ${complete}, ${mainTaskCompleted}) matches snapshot`;
  it(testName, () => {
    const tree = renderer.create(
      <FutureViewSubTask
        mainTaskId="foo"
        subTask={{ id: 'id', order: 1, name: 'foo', inFocus, complete }}
        replaceDateForFork={null}
        mainTaskCompleted={mainTaskCompleted}
      />,
    ).toJSON();
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
