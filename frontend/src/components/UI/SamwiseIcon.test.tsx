import React from 'react';
import { renderIntoDocument } from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import SamwiseIcon from './SamwiseIcon';
import { IconName } from './samwise-icon-types';

const iconNames: readonly IconName[] = [
  'alert',
  'calendar-dark',
  'calendar-light',
  'checked-dark',
  'checked-light',
  'clock',
  'grabber',
  'hide',
  'pin-dark-filled',
  'pin-dark-outline',
  'pin-light-filled',
  'pin-light-outline',
  'settings',
  'show',
  'tag',
  'unchecked',
  'dropdown',
  'x-dark',
  'x-light',
];

it('SamwiseIcon matches snapshot.', () => {
  iconNames.forEach(iconName => {
    const tree = renderer.create(<SamwiseIcon iconName={iconName} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
