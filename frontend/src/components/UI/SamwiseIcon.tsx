/**
 * The Icon Set for Samwise.
 */

import React, {
  KeyboardEvent,
  MouseEvent,
  ReactElement,
  StatelessComponent,
  SVGAttributes,
} from 'react';
import { IconName } from './samwise-icon-types';
import { ReactComponent as Alert } from '../../assets/svgs/alert.svg';
import { ReactComponent as CalendarDark } from '../../assets/svgs/calendar-dark.svg';
import { ReactComponent as CalendarLight } from '../../assets/svgs/calendar-light.svg';
import { ReactComponent as CheckedDark } from '../../assets/svgs/checked-dark.svg';
import { ReactComponent as CheckedLight } from '../../assets/svgs/checked.svg';
import { ReactComponent as Clock } from '../../assets/svgs/clock.svg';
import { ReactComponent as Grabber } from '../../assets/svgs/grabbers.svg';
import { ReactComponent as Hide } from '../../assets/svgs/hide.svg';
import { ReactComponent as Hug } from '../../assets/svgs/hug.svg';
import { ReactComponent as Pencil } from '../../assets/svgs/pencil.svg';
import { ReactComponent as PersonalView } from '../../assets/svgs/personal-view.svg';
import { ReactComponent as PinDarkFilled } from '../../assets/svgs/pin-2-dark-filled.svg';
import { ReactComponent as PinDarkOutline } from '../../assets/svgs/pin-2-dark-outline.svg';
import { ReactComponent as PinLightFilled } from '../../assets/svgs/pin-2-light-filled.svg';
import { ReactComponent as PinLightOutline } from '../../assets/svgs/pin-2-light-outline.svg';
import { ReactComponent as Poke } from '../../assets/svgs/poke.svg';
import { ReactComponent as Repeat } from '../../assets/svgs/repeat.svg';
import { ReactComponent as RepeatLight } from '../../assets/svgs/repeat-light.svg';
import { ReactComponent as Settings } from '../../assets/svgs/settings.svg';
import { ReactComponent as Show } from '../../assets/svgs/show.svg';
import { ReactComponent as Tag } from '../../assets/svgs/tag.svg';
import { ReactComponent as TagLight } from '../../assets/svgs/tag-light.svg';
import { ReactComponent as Unchecked } from '../../assets/svgs/unchecked.svg';
import { ReactComponent as DropDown } from '../../assets/svgs/v.svg';
import { ReactComponent as XDark } from '../../assets/svgs/XDark.svg';
import { ReactComponent as XLight } from '../../assets/svgs/XLight.svg';
import { ReactComponent as RepeatFrequency } from '../../assets/svgs/repeat-frequency.svg';
import { ReactComponent as UserPlus } from '../../assets/svgs/user-plus.svg';
import { ReactComponent as AddTask } from '../../assets/svgs/add-task.svg';
import { ReactComponent as Edit } from '../../assets/svgs/edit.svg';

type SvgProps = SVGAttributes<SVGElement>;

type Props = SvgProps & { readonly iconName: IconName; readonly title: string | undefined };

const SamwiseIcon = ({ iconName, title, ...otherProps }: Props): ReactElement => {
  let SvgComponent: StatelessComponent<SvgProps>;
  let altText: string;
  // let title: string;

  switch (iconName) {
    case 'alert':
      SvgComponent = Alert;
      altText = 'alert';
      break;
    case 'calendar-dark':
      SvgComponent = CalendarDark;
      altText = 'Due date';
      break;
    case 'calendar-light':
      SvgComponent = CalendarLight;
      altText = 'Due date';
      break;
    case 'checked-dark':
      SvgComponent = CheckedDark;
      altText = 'Checked';
      break;
    case 'checked-light':
      SvgComponent = CheckedLight;
      altText = 'Checked';
      break;
    case 'clock':
      SvgComponent = Clock;
      altText = 'clock';
      break;
    case 'grabber':
      SvgComponent = Grabber;
      altText = 'Reorder';
      break;
    case 'hide':
      SvgComponent = Hide;
      altText = 'Hide';
      break;
    case 'hug':
      SvgComponent = Hug;
      altText = 'Give a hug';
      break;
    case 'pencil':
      SvgComponent = Pencil;
      altText = 'Edit';
      break;
    case 'personal-view':
      SvgComponent = PersonalView;
      altText = 'Switch to Personal Samwise';
      break;
    case 'pin-dark-filled':
      SvgComponent = PinDarkFilled;
      altText = 'Unpin from Focus';
      break;
    case 'pin-dark-outline':
      SvgComponent = PinDarkOutline;
      altText = 'Pin to Focus';
      break;
    case 'pin-light-filled':
      SvgComponent = PinLightFilled;
      altText = 'Unpin from Focus';
      break;
    case 'pin-light-outline':
      SvgComponent = PinLightOutline;
      altText = 'Pin to Focus';
      break;
    case 'poke':
      SvgComponent = Poke;
      altText = 'Poke!';
      break;
    case 'repeat':
      SvgComponent = Repeat;
      altText = 'Repeating';
      break;
    case 'repeat-light':
      SvgComponent = RepeatLight;
      altText = 'Repeating Task';
      break;
    case 'settings':
      SvgComponent = Settings;
      altText = 'Settings';
      break;
    case 'show':
      SvgComponent = Show;
      altText = 'Show';
      break;
    case 'tag':
      SvgComponent = Tag;
      altText = 'Tag';
      break;
    case 'tag-light':
      SvgComponent = TagLight;
      altText = 'Tag';
      break;
    case 'unchecked':
      SvgComponent = Unchecked;
      altText = 'unchecked';
      break;
    case 'dropdown':
      SvgComponent = DropDown;
      altText = 'More';
      break;
    case 'x-dark':
      SvgComponent = XDark;
      altText = 'Delete';
      break;
    case 'x-light':
      SvgComponent = XLight;
      altText = 'Delete';
      break;
    case 'x-light-settings':
      SvgComponent = XLight;
      altText = 'Close Settings';
      break;
    case 'repeat-frequency':
      SvgComponent = RepeatFrequency;
      altText = 'Repeat Frequency';
      break;
    case 'user-plus':
      SvgComponent = UserPlus;
      altText = 'Add User';
      break;
    case 'add-task':
      SvgComponent = AddTask;
      altText = 'Add Task';
      break;
    case 'edit':
      SvgComponent = Edit;
      altText = 'Subtask';
      break;
    default:
      throw new Error(`Unrecognized icon name: ${iconName}`);
  }
  const allPropsToSvg = {
    width: '1em',
    height: '1em',
    alt: altText,
    tabIndex: 0,
    title: altText,
    onKeyUp: (e: KeyboardEvent<SVGElement>) => {
      e.stopPropagation();
      if (e.key === ' ' && otherProps.onClick != null) {
        // hacky way to convert space to click. Potentially unsafe but generally OK.
        otherProps.onClick(e as unknown as MouseEvent<SVGElement>);
      }
    },
    ...otherProps,
  };
  return (
    <span title={title ?? altText}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <SvgComponent {...allPropsToSvg} />
    </span>
  );
};

SamwiseIcon.defaultProps = { title: undefined };

export default SamwiseIcon;
