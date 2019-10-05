import React from 'react';
import renderer from 'react-test-renderer';
import TagItem from './TagItem';

it('TagItem without class matches snapshot.', () => {
  const tag = { id: 'foo', order: 1, name: 'Foo', color: 'red', classId: null };
  const tree = renderer.create(<TagItem tag={tag} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('TagItem with class matches snapshot.', () => {
  const tag = { id: 'bar', order: 1, name: 'CS2112: CRITTER', color: 'blue', classId: 'CS2112' };
  const tree = renderer.create(<TagItem tag={tag} />).toJSON();
  expect(tree).toMatchSnapshot();
});
