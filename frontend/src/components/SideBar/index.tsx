import React, { ReactElement } from 'react';
import SamwiseIcon from 'components/UI/SamwiseIcon';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GroupIcon from './GroupIcon';
import styles from './index.module.scss';

type Views =
  | 'personal'
  | 'group';

type Props = {
  groups: string[];
  changeView: (selectedView: Views, selectedGroup: string | undefined) => void;
}

export default ({ groups, changeView }: Props): ReactElement => (
  <div className={styles.SideBar}>
    <button
      type="button"
      onClick={() => changeView('personal', undefined)}
      className={styles.PersonalViewButton}
    >
      <SamwiseIcon iconName="personal-view" />
    </button>
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
      <FontAwesomeIcon icon={faPlus} />
    </button>
  </div>
);
