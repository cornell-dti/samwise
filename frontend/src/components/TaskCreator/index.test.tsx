import React from 'react';
import renderer from 'react-test-renderer';
import TaskCreator from '.';

it('TaskCreator matches snapshot', () => {
  const tree = renderer.create(<TaskCreator />).toJSON();
  expect(tree).toMatchSnapshot();
});
