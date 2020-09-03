import React from 'react';
import renderer from 'react-test-renderer';
import ProgressIndicator from './ProgressIndicator';

it('Mobile completed ProgressIndicator matches snapshot', () => {
  const tree = renderer
    .create(<ProgressIndicator inMobileView allTasksCount={3} completedTasksCount={3} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Mobile incompleted ProgressIndicator matches snapshot', () => {
  const tree = renderer
    .create(<ProgressIndicator inMobileView allTasksCount={1} completedTasksCount={3} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Desktop completed ProgressIndicator matches snapshot', () => {
  const tree = renderer
    .create(<ProgressIndicator inMobileView={false} allTasksCount={3} completedTasksCount={3} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('Desktop incompleted ProgressIndicator matches snapshot', () => {
  const tree = renderer
    .create(<ProgressIndicator inMobileView={false} allTasksCount={1} completedTasksCount={3} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
