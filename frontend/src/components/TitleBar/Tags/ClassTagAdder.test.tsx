import React from 'react';
import renderer from 'react-test-renderer';
import { ProviderForTesting } from 'store';
import ClassTagAdder from './ClassTagAdder';

it('ClassTagAdder matches snapshot.', () => {
  const tree = renderer.create(<ProviderForTesting><ClassTagAdder /></ProviderForTesting>).toJSON();
  expect(tree).toMatchSnapshot();
});
