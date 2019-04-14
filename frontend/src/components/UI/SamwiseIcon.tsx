/**
 * The Icon Set for Samwise.
 */

import React, { ReactElement, StatelessComponent, SVGAttributes } from 'react';
import { IconName } from './samwise-icon-types';
import { ReactComponent as Alert } from '../../assets/svgs/alert.svg';
import { ReactComponent as CalendarDark } from '../../assets/svgs/calendar-dark.svg';
import { ReactComponent as CalendarLight } from '../../assets/svgs/calendar-light.svg';
import { ReactComponent as CheckedDark } from '../../assets/svgs/checked-dark.svg';
import { ReactComponent as CheckedLight } from '../../assets/svgs/checked.svg';
import { ReactComponent as Clock } from '../../assets/svgs/clock.svg';
import { ReactComponent as Grabber } from '../../assets/svgs/grabbers.svg';
import { ReactComponent as Hide } from '../../assets/svgs/hide.svg';
import { ReactComponent as PinDarkFilled } from '../../assets/svgs/pin-2-dark-filled.svg';
import { ReactComponent as PinDarkOutline } from '../../assets/svgs/pin-2-dark-outline.svg';
import { ReactComponent as PinLightFilled } from '../../assets/svgs/pin-2-light-filled.svg';
import { ReactComponent as PinLightOutline } from '../../assets/svgs/pin-2-light-outline.svg';
import { ReactComponent as Settings } from '../../assets/svgs/settings.svg';
import { ReactComponent as Show } from '../../assets/svgs/show.svg';
import { ReactComponent as Tag } from '../../assets/svgs/tag.svg';
import { ReactComponent as Unchecked } from '../../assets/svgs/unchecked.svg';
import { ReactComponent as DropDown } from '../../assets/svgs/v.svg';
import { ReactComponent as XDark } from '../../assets/svgs/XDark.svg';
import { ReactComponent as XLight } from '../../assets/svgs/XLight.svg';

type SvgProps = SVGAttributes<SVGElement>;

type Props = SvgProps & { readonly iconName: IconName };

export default ({ iconName, ...otherProps }: Props): ReactElement => {
  let SvgComponent: StatelessComponent<SvgProps>;
  let altText: string;

  switch (iconName) {
    case 'alert':
      SvgComponent = Alert;
      altText = 'alert';
      break;
    case 'calendar-dark':
      SvgComponent = CalendarDark;
      altText = 'calendar';
      break;
    case 'calendar-light':
      SvgComponent = CalendarLight;
      altText = 'calendar';
      break;
    case 'checked-dark':
      SvgComponent = CheckedDark;
      altText = 'checked';
      break;
    case 'checked-light':
      SvgComponent = CheckedLight;
      altText = 'checked';
      break;
    case 'clock':
      SvgComponent = Clock;
      altText = 'clock';
      break;
    case 'grabber':
      SvgComponent = Grabber;
      altText = 'grabber';
      break;
    case 'hide':
      SvgComponent = Hide;
      altText = 'hide';
      break;
    case 'pin-dark-filled':
      SvgComponent = PinDarkFilled;
      altText = 'pin-filled';
      break;
    case 'pin-dark-outline':
      SvgComponent = PinDarkOutline;
      altText = 'pin-outline';
      break;
    case 'pin-light-filled':
      SvgComponent = PinLightFilled;
      altText = 'pin-filled';
      break;
    case 'pin-light-outline':
      SvgComponent = PinLightOutline;
      altText = 'pin-outline';
      break;
    case 'settings':
      SvgComponent = Settings;
      altText = 'settings';
      break;
    case 'show':
      SvgComponent = Show;
      altText = 'hide';
      break;
    case 'tag':
      SvgComponent = Tag;
      altText = 'tag';
      break;
    case 'unchecked':
      SvgComponent = Unchecked;
      altText = 'unchecked';
      break;
    case 'dropdown':
      SvgComponent = DropDown;
      altText = 'dropdown';
      break;
    case 'x-dark':
      SvgComponent = XDark;
      altText = 'delete';
      break;
    case 'x-light':
      SvgComponent = XLight;
      altText = 'delete';
      break;
    default:
      throw new Error(`Unrecognized icon name: ${iconName}`);
  }
  const allPropsToSvg = { width: '1em', height: '1em', alt: altText, ...otherProps };
  return <SvgComponent {...allPropsToSvg} />;
};
