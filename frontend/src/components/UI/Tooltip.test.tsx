import React from 'react';
import renderer from 'react-test-renderer';
import Tooltip from './Tooltip';

it('Tooltip matches snapshot', () => {
  const tree = renderer.create(<Tooltip text="text" iconName="alert" />).toJSON();
  expect(tree).toMatchSnapshot();
});
