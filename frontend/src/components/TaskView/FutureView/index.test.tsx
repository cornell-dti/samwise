import React from 'react';
import renderer from 'react-test-renderer';
import { ProviderForTesting } from 'store';
import { enableTestMode, disableTestMode } from 'hooks/time-hook';
import FutureView, { FutureViewConfig } from '.';
import { FutureViewContainerType } from './future-view-types';

const createFutureViewConfig = (
  containerType: FutureViewContainerType, doesShowCompletedTasks: boolean,
): FutureViewConfig => ({
  displayOption: { containerType, doesShowCompletedTasks },
  offset: 0,
});

const dummyOnConfigChange = (): void => { };

const createTest = (configName: string, config: FutureViewConfig): void => {
  it(`FutureView with config ${configName} matches snapshot.`, () => {
    enableTestMode(1800000000000); // around 2027-01-15
    const tree = renderer.create(
      <ProviderForTesting>
        <FutureView config={config} onConfigChange={dummyOnConfigChange} />
      </ProviderForTesting>,
    ).toJSON();
    expect(tree).toMatchSnapshot();
    disableTestMode();
  });
};

createTest('n-days, show-completed', createFutureViewConfig('N_DAYS', true));
createTest('biweekly, show-completed', createFutureViewConfig('BIWEEKLY', true));
createTest('monthly, show-completed', createFutureViewConfig('MONTHLY', true));
createTest('n-days, hide-completed', createFutureViewConfig('N_DAYS', false));
createTest('biweekly, hide-completed', createFutureViewConfig('BIWEEKLY', false));
createTest('monthly, hide-completed', createFutureViewConfig('MONTHLY', false));
