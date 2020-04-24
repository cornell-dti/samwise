import React, { ReactElement, KeyboardEvent } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SettingsButton from 'components/TitleBar/Settings/SettingsButton';
import GroupIcon from './GroupIcon';
import styles from './index.module.scss';

type Views =
  | 'personal'
  | 'group';

type Props = {
  groups: string[];
  changeView: (selectedView: Views, selectedGroup: string | undefined) => void;
}

export default ({ groups, changeView }: Props): ReactElement => {
  const pressedIcon = (
    e: KeyboardEvent,
    selectedView: Views,
    selectedGroup: string | undefined,
  ): void => {
    if (e.key === 'Enter' || e.key === ' ') changeView(selectedView, selectedGroup);
  };
  return (
    <div className={styles.SideBar}>
      <span
        role="presentation"
        onClick={() => changeView('personal', undefined)}
        onKeyPress={(e: KeyboardEvent) => pressedIcon(e, 'personal', undefined)}
        className={styles.PersonalViewButton}
      >
        <SamwiseIcon iconName="personal-view" />
      </span>
      <div className={styles.GroupIcons}>
        <p>My Groups</p>
        {
          groups.map((g) => (
            <GroupIcon
              classCode={g}
              handleClick={changeView}
              pressedIcon={pressedIcon}
              key={g}
            />
          ))
        }
        <span
          role="presentation"
          className={styles.PlusIcon}
        >
          <FontAwesomeIcon icon={faPlus} />
          <p>New Group</p>
        </span>
      </div>
      <span className={styles.Links}>
        <SettingsButton />
      </span>
    </div>
  );
};
