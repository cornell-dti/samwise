import React from 'react';
import renderer from 'react-test-renderer';
import { ProviderForTesting } from '../../../store';
import { initialStateForTesting } from '../../../store/state';
import { Onboard } from './Onboard';

it('TitleBar matches snapshot', () => {
  const tree = renderer
    .create(
      <ProviderForTesting>
        <Onboard
          classTags={Array.from(initialStateForTesting.tags.values())}
          completedOnboarding={false}
        />
      </ProviderForTesting>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
