import React from 'react';
import renderer from 'react-test-renderer';
import DropdownItem from './DropdownItem';

it('DropdownItem matches snapshot.', () => {
  const tree = renderer
    .create(
      <DropdownItem item={{ key: 42, value: 'foo-bar' }} className="test" onSelect={() => {}} />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
