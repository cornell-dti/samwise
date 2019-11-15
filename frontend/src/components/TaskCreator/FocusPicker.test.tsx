import React from 'react';
import renderer from 'react-test-renderer';
import FocusPicker from './FocusPicker';

it('Pinned FocusPicker matches snapshot', () => {
  const tree = renderer.create(
    <FocusPicker pinned onPinChange={() => { }} />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Unpinned FocusPicker matches snapshot', () => {
  const tree = renderer.create(
    <FocusPicker pinned={false} onPinChange={() => { }} />,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
