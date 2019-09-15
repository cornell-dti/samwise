import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { store } from 'store/store';
import SettingsButton from './SettingsButton';

it('SettingsButton matches snapshot.', () => {
  const tree = renderer.create(<Provider store={store}><SettingsButton /></Provider>).toJSON();
  expect(tree).toMatchSnapshot();
});
