/**
 * The Icon Set for Samwise.
 */

import React, { ReactElement, StatelessComponent, SVGAttributes } from 'react';
import { IconName } from './samwise-icon-types';
import { ReactComponent as AlertComponent } from '../../assets/svgs/alert.svg';
import { ReactComponent as CalendarDarkComponent } from '../../assets/svgs/calendar-dark.svg';
import { ReactComponent as CalendarLightComponent } from '../../assets/svgs/calendar-light.svg';
import { ReactComponent as CheckedDarkComponent } from '../../assets/svgs/checked-dark.svg';
import { ReactComponent as CheckedLightComponent } from '../../assets/svgs/checked.svg';
import { ReactComponent as ClockComponent } from '../../assets/svgs/clock.svg';
import { ReactComponent as GrabberComponent } from '../../assets/svgs/grabbers.svg';
import { ReactComponent as HideComponent } from '../../assets/svgs/hide.svg';
import { ReactComponent as PinDarkFilledComponent } from '../../assets/svgs/pin-2-dark-filled.svg';
import {
  ReactComponent as PinDarkOutlineComponent,
} from '../../assets/svgs/pin-2-dark-outline.svg';
import {
  ReactComponent as PinLightFilledComponent,
} from '../../assets/svgs/pin-2-light-filled.svg';
import {
  ReactComponent as PinLightOutlineComponent,
} from '../../assets/svgs/pin-2-light-outline.svg';
import { ReactComponent as SettingsComponent } from '../../assets/svgs/settings.svg';
import { ReactComponent as ShowComponent } from '../../assets/svgs/show.svg';
import { ReactComponent as TagComponent } from '../../assets/svgs/tag.svg';
import { ReactComponent as UncheckedComponent } from '../../assets/svgs/unchecked.svg';
import { ReactComponent as DropDownComponent } from '../../assets/svgs/v.svg';
import { ReactComponent as XDarkComponent } from '../../assets/svgs/XDark.svg';
import { ReactComponent as XLightComponent } from '../../assets/svgs/XLight.svg';

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
