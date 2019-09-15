import React from 'react';
import { Map } from 'immutable';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { Tag } from 'store/store-types';
import { store } from 'store/store';
import { ClassAdder, ExamImporter, TagsContainer, SettingsPage } from './SettingsPage';

it('ClassAdder matches snapshot.', () => {
  const tree = renderer.create(<Provider store={store}><ClassAdder /></Provider>).toJSON();
  expect(tree).toMatchSnapshot();
});

it('ExamImporter matches snapshot.', () => {
  const tree = renderer.create(<Provider store={store}><ExamImporter /></Provider>).toJSON();
  expect(tree).toMatchSnapshot();
});

it('TagsContainer matches snapshot.', () => {
  const tree = renderer.create(
    <Provider store={store}>
      <TagsContainer title="TITLE">TEST</TagsContainer>
    </Provider>,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});

it('SettingsPage matches snapshot.', () => {
  const tags = Map<string, Tag>()
    .set('t1', { id: 't1', order: 1, name: 'T1', color: 'red', classId: null })
    .set('t2', { id: 't2', order: 2, name: 'CS2112: Critter', color: 'red', classId: 'classId' });
  const tree = renderer.create(
    <Provider store={store}>
      <SettingsPage tags={tags} />
    </Provider>,
  ).toJSON();
  expect(tree).toMatchSnapshot();
});
