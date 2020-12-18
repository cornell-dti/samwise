import React from 'react';
import renderer from 'react-test-renderer';
import { ProviderForTesting } from '../../store';
import { TaskCreatorContextProvider, TaskCreator } from '.';

it('TaskCreator matches snapshot', () => {
  const tree = renderer
    .create(
      <ProviderForTesting>
        <TaskCreatorContextProvider>
          <TaskCreator view="personal" />
        </TaskCreatorContextProvider>
      </ProviderForTesting>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
