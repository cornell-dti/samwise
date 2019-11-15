import React from 'react';
import renderer from 'react-test-renderer';
import { ProviderForTesting } from 'store';
import FutureViewTask from './FutureViewTask';

const createTest = (
  inNDaysView: boolean, doesShowCompletedTasks: boolean, isInMainList: boolean,
): void => {
  const testName = `FutureViewTask(${inNDaysView}, ${doesShowCompletedTasks}, ${isInMainList}) matches snapshot.`;
  it(testName, () => {
    const tree = renderer.create(
      <ProviderForTesting>
        <FutureViewTask
          taskId="foo"
          containerDate="2030-01-01"
          inNDaysView={inNDaysView}
          taskEditorPosition="left"
          calendarPosition="top"
          doesShowCompletedTasks={doesShowCompletedTasks}
          isInMainList={isInMainList}
        />
      </ProviderForTesting>,
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
