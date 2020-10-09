import React from 'react';
import renderer from 'react-test-renderer';
import { ProviderForTesting } from '../../../store';
import ClearFocus from './ClearFocus';

it('ClearFocus matches snapshot', () => {
  const tree = renderer
    .create(
      <ProviderForTesting>
        <ClearFocus />
      </ProviderForTesting>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
