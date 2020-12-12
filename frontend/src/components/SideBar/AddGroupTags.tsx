import React, { ReactElement } from 'react';
import { Tag } from 'common/types/store-types';
import { store } from '../../store/store';
import styles from './AddGroupTags.module.scss';
import { createGroup } from '../../firebase/actions';

type AddGroupTagsProps = {
  readonly show: boolean;
  readonly setShow: (show: boolean) => void;
};

function newGroup(classCode: string): void {
  createGroup(`New ${classCode} Group`, new Date(), classCode);
}

export default function AddGroupTags({ show, setShow }: AddGroupTagsProps): ReactElement {
  const { tags } = store.getState();
  const classes: Tag[] = [];
  tags.forEach((t: Tag) => {
    if (t.classId !== null) {
      classes.push(t);
    }
  });

  return (
    <div className={styles.PositionedWrapper}>
      {show && (
        <div
          className={styles.AddGroupTags}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          {classes.map(({ name, classId, color }): ReactElement | undefined => {
            const classCode = name.split(':')[0];
            return (
              <div key={name}>
                {classId !== null && (
                  <button
                    type="button"
                    className={styles.ClassItem}
                    onClick={() => newGroup(classCode)}
                  >
                    <div className={styles.Color} style={{ backgroundColor: color }}>
                      {' '}
                    </div>
                    <p>{classCode}</p>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
