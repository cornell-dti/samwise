import React from 'react';
import renderer from 'react-test-renderer';
import Bear from './Bear';

it('Mobile completed bear matches snapshot', () => {
  const tree = renderer.create(
    <Bear inMobileView allTasksCount={3} completedTasksCount={3} />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Mobile incompleted bear matches snapshot', () => {
  const tree = renderer.create(
    <Bear inMobileView allTasksCount={1} completedTasksCount={3} />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Desktop completed bear matches snapshot', () => {
  const tree = renderer.create(
    <Bear inMobileView={false} allTasksCount={3} completedTasksCount={3} />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Desktop incompleted bear matches snapshot', () => {
  const tree = renderer.create(
    <Bear inMobileView={false} allTasksCount={1} completedTasksCount={3} />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
