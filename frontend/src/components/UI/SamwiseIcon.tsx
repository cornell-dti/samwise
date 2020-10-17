/**
 * The Icon Set for Samwise.
 */

import React, { ReactElement, CSSProperties } from 'react';
import { IconName } from './samwise-icon-types';
import styles from './SamwiseIcon.module.scss';
import {
  Alert,
  ArrowDownDark,
  BellOutline,
  BellLight,
  CalendarDark,
  CalendarLight,
  CheckedDark,
  CheckedLight,
  Clock,
  Exit,
  Grabber,
  Hide,
  Hug,
  Pencil,
  PersonalView,
  PinDarkFilled,
  PinDarkOutline,
  PinLightFilled,
  PinLightOutline,
  Poke,
  Repeat,
  RepeatLight,
  Settings,
  Show,
  Tag,
  TagLight,
  Unchecked,
  DropDown,
  XDark,
  XLight,
  RepeatFrequency,
  UserPlus,
  AddTask,
  Edit,
} from '../../assets/assets-constants';

type Props = {
  readonly iconName: IconName;
  readonly title?: string;
  readonly className?: string;
  readonly containerClassName?: string;
  readonly style?: CSSProperties;
  readonly tabIndex?: number;
  readonly onClick?: () => void;
};

const SamwiseIcon = ({
  iconName,
  className,
  containerClassName,
  style,
  tabIndex,
  title,
  onClick,
}: Props): ReactElement => {
  let svg: string;
  let altText: string;
  // let title: string;

  switch (iconName) {
    case 'alert':
      svg = Alert;
      altText = 'alert';
      break;
    case 'arrow-down-dark':
      svg = ArrowDownDark;
      altText = 'Forward/Backward';
      break;
    case 'bell-outline':
      svg = BellOutline;
      altText = 'Nudge!';
      break;
    case 'bell-light':
      svg = BellLight;
      altText = 'Remove nudge';
      break;
    case 'calendar-dark':
      svg = CalendarDark;
      altText = 'Due date';
      break;
    case 'calendar-light':
      svg = CalendarLight;
      altText = 'Due date';
      break;
    case 'checked-dark':
      svg = CheckedDark;
      altText = 'Checked';
      break;
    case 'checked-light':
      svg = CheckedLight;
      altText = 'Checked';
      break;
    case 'clock':
      svg = Clock;
      altText = 'clock';
      break;
    case 'exit':
      svg = Exit;
      altText = 'Leave group';
      break;
    case 'grabber':
      svg = Grabber;
      altText = 'Reorder';
      break;
    case 'hide':
      svg = Hide;
      altText = 'Hide';
      break;
    case 'hug':
      svg = Hug;
      altText = 'Give a hug';
      break;
    case 'pencil':
      svg = Pencil;
      altText = 'Edit';
      break;
    case 'personal-view':
      svg = PersonalView;
      altText = 'Switch to Personal Samwise';
      break;
    case 'pin-dark-filled':
      svg = PinDarkFilled;
      altText = 'Unpin from Focus';
      break;
    case 'pin-dark-outline':
      svg = PinDarkOutline;
      altText = 'Pin to Focus';
      break;
    case 'pin-light-filled':
      svg = PinLightFilled;
      altText = 'Unpin from Focus';
      break;
    case 'pin-light-outline':
      svg = PinLightOutline;
      altText = 'Pin to Focus';
      break;
    case 'poke':
      svg = Poke;
      altText = 'Poke!';
      break;
    case 'repeat':
      svg = Repeat;
      altText = 'Repeating';
      break;
    case 'repeat-light':
      svg = RepeatLight;
      altText = 'Repeating Task';
      break;
    case 'settings':
      svg = Settings;
      altText = 'Settings';
      break;
    case 'show':
      svg = Show;
      altText = 'Show';
      break;
    case 'tag':
      svg = Tag;
      altText = 'Tag';
      break;
    case 'tag-light':
      svg = TagLight;
      altText = 'Tag';
      break;
    case 'unchecked':
      svg = Unchecked;
      altText = 'unchecked';
      break;
    case 'dropdown':
      svg = DropDown;
      altText = 'More';
      break;
    case 'x-dark':
      svg = XDark;
      altText = 'Delete';
      break;
    case 'x-light':
      svg = XLight;
      altText = 'Delete';
      break;
    case 'x-light-settings':
      svg = XLight;
      altText = 'Close Settings';
      break;
    case 'repeat-frequency':
      svg = RepeatFrequency;
      altText = 'Repeat Frequency';
      break;
    case 'user-plus':
      svg = UserPlus;
      altText = 'Add User';
      break;
    case 'add-task':
      svg = AddTask;
      altText = 'Add Task';
      break;
    case 'edit':
      svg = Edit;
      altText = 'Subtask';
      break;
    default:
      throw new Error(`Unrecognized icon name: ${iconName}`);
  }
  return (
    <span
      role="button"
      className={containerClassName}
      title={title ?? altText}
      tabIndex={0}
      onClick={onClick}
      onKeyUp={(e) => {
        e.stopPropagation();
        if (e.key === ' ' && onClick != null) {
          onClick();
        }
      }}
    >
      <img
        src={svg}
        className={
          className != null
            ? `${styles.SamwiseIconDefaultStyle} ${className}`
            : styles.SamwiseIconDefaultStyle
        }
        tabIndex={tabIndex}
        style={style}
        alt={altText}
      />
    </span>
  );
};

export default SamwiseIcon;
