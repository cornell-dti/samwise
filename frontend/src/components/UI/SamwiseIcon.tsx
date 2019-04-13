/**
 * The Icon Set for Samwise.
 */

import React, { ReactElement, StatelessComponent, SVGAttributes } from 'react';
import AlertComponent from '../../assets/svgs/alert.svg';
import CalendarDarkComponent from '../../assets/svgs/calendar-dark.svg';
import CalendarLightComponent from '../../assets/svgs/calendar-light.svg';
import CheckedDarkComponent from '../../assets/svgs/checked-dark.svg';
import CheckedLightComponent from '../../assets/svgs/checked.svg';
import ClockComponent from '../../assets/svgs/clock.svg';
import GrabberComponent from '../../assets/svgs/grabbers.svg';
import HideComponent from '../../assets/svgs/hide.svg';
import PinDarkFilledComponent from '../../assets/svgs/pin-2-dark-filled.svg';
import PinDarkOutlineComponent from '../../assets/svgs/pin-2-dark-outline.svg';
import PinLightFilledComponent from '../../assets/svgs/pin-2-light-filled.svg';
import PinLightOutlineComponent from '../../assets/svgs/pin-2-light-outline.svg';
import SettingsComponent from '../../assets/svgs/settings.svg';
import ShowComponent from '../../assets/svgs/show.svg';
import TagComponent from '../../assets/svgs/tag.svg';
import UncheckedComponent from '../../assets/svgs/unchecked.svg';
import DropDownComponent from '../../assets/svgs/v.svg';
import XDarkComponent from '../../assets/svgs/XDark.svg';
import XLightComponent from '../../assets/svgs/XLight.svg';
import { IconName } from './samwise-icon-types';

type SvgProps = SVGAttributes<SVGElement>;

type Props = SvgProps & { readonly iconName: IconName };

export default ({ iconName, ...otherProps }: Props): ReactElement => {
  let SvgComponent: StatelessComponent<SvgProps>;
  let altText: string;

  switch (iconName) {
    case 'alert':
      SvgComponent = AlertComponent;
      altText = 'alert';
      break;
    case 'calendar-dark':
      SvgComponent = CalendarDarkComponent;
      altText = 'calendar';
      break;
    case 'calendar-light':
      SvgComponent = CalendarLightComponent;
      altText = 'calendar';
      break;
    case 'checked-dark':
      SvgComponent = CheckedDarkComponent;
      altText = 'checked';
      break;
    case 'checked-light':
      SvgComponent = CheckedLightComponent;
      altText = 'checked';
      break;
    case 'clock':
      SvgComponent = ClockComponent;
      altText = 'clock';
      break;
    case 'grabber':
      SvgComponent = GrabberComponent;
      altText = 'grabber';
      break;
    case 'hide':
      SvgComponent = HideComponent;
      altText = 'hide';
      break;
    case 'pin-dark-filled':
      SvgComponent = PinDarkFilledComponent;
      altText = 'pin-filled';
      break;
    case 'pin-dark-outline':
      SvgComponent = PinDarkOutlineComponent;
      altText = 'pin-outline';
      break;
    case 'pin-light-filled':
      SvgComponent = PinLightFilledComponent;
      altText = 'pin-filled';
      break;
    case 'pin-light-outline':
      SvgComponent = PinLightOutlineComponent;
      altText = 'pin-outline';
      break;
    case 'settings':
      SvgComponent = SettingsComponent;
      altText = 'settings';
      break;
    case 'show':
      SvgComponent = ShowComponent;
      altText = 'hide';
      break;
    case 'tag':
      SvgComponent = TagComponent;
      altText = 'tag';
      break;
    case 'unchecked':
      SvgComponent = UncheckedComponent;
      altText = 'unchecked';
      break;
    case 'dropdown':
      SvgComponent = DropDownComponent;
      altText = 'dropdown';
      break;
    case 'x-dark':
      SvgComponent = XDarkComponent;
      altText = 'delete';
      break;
    case 'x-light':
      SvgComponent = XLightComponent;
      altText = 'delete';
      break;
    default:
      throw new Error(`Unrecognized icon name: ${iconName}`);
  }
  const allPropsToSvg = { ...otherProps, alt: altText };
  return <SvgComponent {...allPropsToSvg} />;
};
