import React from 'react';
import { Map } from 'immutable';
import renderer from 'react-test-renderer';
import { Tag } from 'common/lib/types/store-types';
import { ProviderForTesting } from '../../../store';
import { ClassAdder, ExamImporter, TagsContainer, SettingsPage } from './SettingsPage';

it('ClassAdder matches snapshot.', () => {
  const tree = renderer
    .create(
      <ProviderForTesting>
        <ClassAdder />
      </ProviderForTesting>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('ExamImporter matches snapshot.', () => {
  const tree = renderer
    .create(
      <ProviderForTesting>
        <ExamImporter />
      </ProviderForTesting>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('TagsContainer matches snapshot.', () => {
  const tree = renderer
    .create(
      <ProviderForTesting>
        <TagsContainer title="TITLE">TEST</TagsContainer>
      </ProviderForTesting>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

it('SettingsPage matches snapshot.', () => {
  const tags = Map<string, Tag>()
    .set('t1', { id: 't1', order: 1, name: 'T1', color: 'red', classId: null })
    .set('t2', { id: 't2', order: 2, name: 'CS2112: Critter', color: 'red', classId: 'classId' });
  const tree = renderer
    .create(
      <ProviderForTesting>
        <SettingsPage tags={tags} />
      </ProviderForTesting>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
