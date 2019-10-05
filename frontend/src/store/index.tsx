import React, { ReactElement } from 'react';
import { Provider as ReactReduxProvider } from 'react-redux';
import { store, storeForTesting } from './store';

type Props = { readonly children: ReactElement };

export const Provider = ({ children }: Props): ReactElement => (
  <ReactReduxProvider store={store}>{children}</ReactReduxProvider>
);

export const ProviderForTesting = ({ children }: Props): ReactElement => (
  <ReactReduxProvider store={storeForTesting}>{children}</ReactReduxProvider>
);
