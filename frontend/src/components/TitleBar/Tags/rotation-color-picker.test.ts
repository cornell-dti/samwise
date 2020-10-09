import { Map } from 'immutable';
import { Tag } from 'common/types/store-types';
import { getUnusedColorForTesting } from './rotation-color-picker';

it('Colors correctly rotate', () => {
  expect(getUnusedColorForTesting(Map())).toBe('#bb5769');
  let map = Map<string, Tag>().set('id1', {
    id: 'id1',
    order: 1,
    name: 'foo',
    color: '#bb5769',
    classId: null,
  });
  expect(getUnusedColorForTesting(map)).toBe('#ff8a8a');
  map = map.set('id2', { id: 'id2', order: 2, name: 'foo', color: '#ff8a8a', classId: null });
  expect(getUnusedColorForTesting(map)).toBe('#ea5e3d');
  map = map.set('id3', { id: 'id3', order: 3, name: 'foo', color: '#ea5e3d', classId: null });
  expect(getUnusedColorForTesting(map)).toBe('#fcab10');
});
