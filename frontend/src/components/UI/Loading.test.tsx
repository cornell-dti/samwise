import React from 'react';
import { renderIntoDocument } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import Loading from './Loading';

it('Loading can render', () => {
  renderIntoDocument(<Loading />);
});

it('Loading matches snapshot.', () => {
  const tree = renderer.create(<Loading />).toJSON();
  expect(tree).toMatchSnapshot();
});
