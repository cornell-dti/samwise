import React from 'react';
import renderer from 'react-test-renderer';
import { ProgressTracker } from '.';

it('Mobile completed ProgressTracker matches snapshot', () => {
  const tree = renderer.create(
    <ProgressTracker inMobileView allTasksCount={3} completedTasksCount={3} />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Mobile incompleted ProgressTracker matches snapshot', () => {
  const tree = renderer.create(
    <ProgressTracker inMobileView allTasksCount={1} completedTasksCount={3} />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Desktop completed ProgressTracker matches snapshot', () => {
  const tree = renderer.create(
    <ProgressTracker inMobileView={false} allTasksCount={3} completedTasksCount={3} />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Desktop incompleted ProgressTracker matches snapshot', () => {
  const tree = renderer.create(
    <ProgressTracker inMobileView={false} allTasksCount={1} completedTasksCount={3} />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
