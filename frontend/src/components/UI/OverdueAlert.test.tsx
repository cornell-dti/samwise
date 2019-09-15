import React from 'react';
import renderer from 'react-test-renderer';
import OverdueAlert from './OverdueAlert';

it('OverdueAlert in future-view-task matches snapshot.', () => {
  const tree = renderer.create(<OverdueAlert target="future-view-task" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('OverdueAlert in task-card matches snapshot.', () => {
  const tree = renderer.create(<OverdueAlert target="task-card" />).toJSON();
  expect(tree).toMatchSnapshot();
});
