import React from 'react';
import renderer from 'react-test-renderer';
import CompletedSeparator from './CompletedSeparator';

it('CompletedSeparator when showing completed tasks matches snapshot', () => {
  const tree = renderer.create(
    <CompletedSeparator
      count={10}
      doesShowCompletedTasks
      onDoesShowCompletedTasksChange={() => { }}
    />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('CompletedSeparator when not showing completed tasks matches snapshot', () => {
  const tree = renderer.create(
    <CompletedSeparator
      count={5}
      doesShowCompletedTasks={false}
      onDoesShowCompletedTasksChange={() => { }}
    />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
