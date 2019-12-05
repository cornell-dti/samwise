import React from 'react';
import renderer from 'react-test-renderer';
import { ProviderForTesting } from 'store';
import FutureViewDay from './FutureViewDay';

const createTest = (
  inNDaysView: boolean, doesShowCompletedTasks: boolean,
): void => {
  const testName = `FutureViewDay(${inNDaysView}, ${doesShowCompletedTasks}) matches snapshot.`;
  const date = new Date(Date.UTC(2030, 0, 1));
  const simpleDate = {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth(),
    date: date.getUTCDate(),
    day: date.getUTCDay(),
    text: date.toDateString(),
  };
  it(testName, () => {
    const tree = renderer.create(
      <ProviderForTesting>
        <FutureViewDay
          date={simpleDate}
          inNDaysView={inNDaysView}
          taskEditorPosition="left"
          calendarPosition="top"
          doesShowCompletedTasks={doesShowCompletedTasks}
        />
      </ProviderForTesting>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
};
