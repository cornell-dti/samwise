import React from 'react';
import renderer from 'react-test-renderer';
import ColorEditor from './ColorEditor';

it('ColorEditor matches snapshot.', () => {
  const onChange = (): void => { };
  const tree = renderer.create(<ColorEditor color="green" onChange={onChange} />).toJSON();
  expect(tree).toMatchSnapshot();
});
