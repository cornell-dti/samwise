import React, { ReactElement, useState } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SettingsButton from 'components/TitleBar/Settings/SettingsButton';
import GroupIcon from './GroupIcon';
import styles from './index.module.scss';
import AddGroupTags from './AddGroupTags';
import { Views } from './types';

type Props = {
  groups: string[];
  changeView: (selectedView: Views, selectedGroup: string | undefined) => void;
}

export default ({ groups, changeView }: Props): ReactElement => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState('personal');
  return (
    <div className={styles.SideBar}>
      <button
        type="button"
        onClick={() => changeView('personal', undefined)}
        className={styles.PersonalViewButton}
      >
        <SamwiseIcon iconName="personal-view" />
      </button>
      <div className={styles.GroupIcons}>
        <p>My Groups</p>
        {
          groups.map((g) => (
            <GroupIcon
              groupName={g}
              handleClick={changeView}
              key={g}
            />
          ))
        }
        <button type="button" className={styles.PlusIcon}>
          <div
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <FontAwesomeIcon className={styles.PlusIcon} icon={faPlus} />
            {!showDropdown && <p>New Group</p>}
          </div>
          {showDropdown && <AddGroupTags show={showDropdown} setShow={setShowDropdown} />}
        </button>
      </div>
      <span className={styles.Links}>
        <SettingsButton />
      </span>
    </div>
  );
};
