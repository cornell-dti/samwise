import React from 'react';
import renderer from 'react-test-renderer';
import { ProviderForTesting } from 'store';
import { enableTestMode, disableTestMode } from 'hooks/time-hook';
import TitleBar from '.';

it('TitleBar matches snapshot', () => {
  enableTestMode(1800000000000); // around 2027-01-15
  const tree = renderer.create(<ProviderForTesting><TitleBar /></ProviderForTesting>).toJSON();
  expect(tree).toMatchSnapshot();
  disableTestMode();
});
