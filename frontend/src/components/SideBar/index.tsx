import React, { ReactElement, KeyboardEvent, useState } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SettingsButton from 'components/TitleBar/Settings/SettingsButton';
import GroupIcon from './GroupIcon';
import styles from './index.module.scss';
import AddGroupTags from './AddGroupTags';

type Views =
  | 'personal'
  | 'group';

type Props = {
  groups: string[];
  changeView: (selectedView: Views, selectedGroup: string | undefined) => void;
}

export default ({ groups, changeView }: Props): ReactElement => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState('personal');
  const handleClick = (
    selectedView: Views,
    selectedGroup: string | undefined,
    e?: KeyboardEvent,
  ): void => {
    if (e === undefined || e.key === 'Enter' || e.key === ' ') {
      changeView(selectedView, selectedGroup);
      setSelected(selectedGroup || selectedView);
    }
  };
  return (
    <div className={styles.SideBar}>
      <span
        role="presentation"
        onClick={() => handleClick('personal', undefined)}
        onKeyPress={(e: KeyboardEvent) => handleClick('personal', undefined, e)}
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
              handleClick={handleClick}
              selected={selected === g}
              key={g}
            />
          ))
        }
        <span
          role="presentation"
          className={styles.AddGroup}
        >
          <div
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <FontAwesomeIcon className={styles.PlusIcon} icon={faPlus} />
            {!showDropdown && <p>New Group</p>}
          </div>
          {showDropdown && <AddGroupTags show={showDropdown} setShow={setShowDropdown} />}
        </span>
      </div>
      <span className={styles.Links}>
        <SettingsButton />
      </span>
    </div>
  );
};
