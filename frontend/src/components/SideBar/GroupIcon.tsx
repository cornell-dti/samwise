import React, { ReactElement } from 'react';
import { connect } from 'react-redux';
import { State, Tag } from 'common/types/store-types';
import { NONE_TAG } from 'common/util/tag-util';
import { Views } from './types';
import sidebarStyles from './index.module.scss';
import styles from './GroupIcon.module.scss';
import { getOrderedTags } from '../../store/selectors';

type OwnProps = {
  classCode: string;
  handleClick: (selectedView: Views, selectedGroup: string | undefined, e?: KeyboardEvent) => void;
  selected: boolean;
};

type Props = OwnProps & { readonly tags: Tag[] };

const GroupIcon = ({ classCode, handleClick, selected, tags }: Props): ReactElement => {
  const currentClassTag =
    tags.find(({ classId }) => {
      const segments = classId !== null ? classId.split(/\s+/) : null;
      if (segments === null) {
        return false;
      }
      const classIdWithoutNumerical = `${segments[1]} ${segments[2]}`;
      return classIdWithoutNumerical === classCode;
    }) ?? NONE_TAG;
  const { color } = currentClassTag;
  return (
    <button
      type="button"
      onClick={() => handleClick('group', classCode)}
      className={`${sidebarStyles.GroupLetterIcon} ${styles.GroupIcon}${
        selected ? ` ${styles.Active}` : ''
      }`}
      style={{ background: color }}
    >
      {classCode.charAt(0)}
    </button>
  );
};

const Connected = connect((state: State) => ({ tags: getOrderedTags(state) }))(GroupIcon);
export default Connected;
