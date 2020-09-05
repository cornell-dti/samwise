import React, { ReactElement, useState } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SettingsButton from 'components/TitleBar/Settings/SettingsButton';
import GroupIcon from './GroupIcon';
import styles from './index.module.css';
import AddGroupTags from './AddGroupTags';
import { Views } from './types';

type Props = {
  groups: string[];
  changeView: (selectedView: Views, selectedGroup: string | undefined) => void;
};

export default ({ groups, changeView }: Props): ReactElement => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState('personal');

  const handleIconClick = (view: Views, group?: string): void => {
    changeView(view, group);
    setSelected(group !== undefined ? group : view);
  };

  return (
    <div className={styles.SideBar}>
      <button
        type="button"
        onClick={() => handleIconClick('personal')}
        className={styles.PersonalViewButton}
      >
        <SamwiseIcon iconName="personal-view" className={styles.PersonalViewButtonIcon} />
      </button>
      <div className={styles.GroupIcons}>
        <p>My Groups</p>
        {groups.map((g) => (
          <GroupIcon
            classCode={g}
            handleClick={() => handleIconClick('group', g)}
            selected={selected === g}
            key={g}
          />
        ))}
        <span>
          <button
            type="button"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
            className={styles.AddGroup}
          >
            <FontAwesomeIcon className={styles.PlusIcon} icon={faPlus} />
          </button>
          {!showDropdown && <p>New Group</p>}
          <AddGroupTags show={showDropdown} setShow={setShowDropdown} />
        </span>
      </div>
      <span className={styles.Links}>
        <SettingsButton />
      </span>
    </div>
  );
};
