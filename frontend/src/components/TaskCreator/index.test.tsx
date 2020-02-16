import React from 'react';
import renderer from 'react-test-renderer';
import { ProviderForTesting } from 'store';
import TaskCreator from '.';

it('TaskCreator matches snapshot', () => {
  const tree = renderer.create(<ProviderForTesting><TaskCreator /></ProviderForTesting>).toJSON();
  expect(tree).toMatchSnapshot();
});
