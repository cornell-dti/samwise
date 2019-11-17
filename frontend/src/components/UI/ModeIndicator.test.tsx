import React from 'react';
import renderer from 'react-test-renderer';
import ModeIndicator, { ConfigurableModeIndicator } from './ModeIndicator';

it('ConfigurableModeIndicator DEV matches snapshot.', () => {
  const tree = renderer.create(<ConfigurableModeIndicator mode="DEV" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('ConfigurableModeIndicator STAGING matches snapshot.', () => {
  const tree = renderer.create(<ConfigurableModeIndicator mode="STAGING" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('ConfigurableModeIndicator PROD matches snapshot.', () => {
  const tree = renderer.create(<ConfigurableModeIndicator mode="PROD" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('ModeIndicator(DEV) matches snapshot.', () => {
  const tree = renderer.create(<ModeIndicator />).toJSON();
  expect(tree).toMatchSnapshot();
});
