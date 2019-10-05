import React from 'react';
import renderer from 'react-test-renderer';
import OtherTagAdder from './OtherTagAdder';

it('OtherTagAdder matches snapshot.', () => {
  const tree = renderer.create(<OtherTagAdder />).toJSON();
  expect(tree).toMatchSnapshot();
});
