import React from 'react';
import renderer from 'react-test-renderer';
import { AllComplete } from '.';

const createTest = (completedTasksCount: number, allTasksCount: number): void => {
  it(`AllComplete(${completedTasksCount}, ${allTasksCount}) matches snapshot`, () => {
    const tree = renderer.create(
      <AllComplete completedTasksCount={completedTasksCount} allTasksCount={allTasksCount} />,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
};

createTest(0, 3);
createTest(1, 3);
createTest(2, 3);
createTest(3, 3);
