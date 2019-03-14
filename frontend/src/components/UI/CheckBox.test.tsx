/* eslint-disable react/no-find-dom-node */
import React from 'react';
import * as TestUtils from 'react-dom/test-utils';
import CheckBox from './CheckBox';

it('check box can render', () => {
  let checked = false;
  const onChange = (): void => {
    checked = !checked;
  };
  TestUtils.renderIntoDocument(<CheckBox checked={checked} onChange={onChange} />);
  onChange();
  TestUtils.renderIntoDocument(<CheckBox checked={checked} onChange={onChange} inverted />);
});
