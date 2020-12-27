import React from 'react';
import renderer from 'react-test-renderer';
import { initialStateForTesting } from 'common/store/state';
import { ProviderForTesting } from '../../../store';
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
