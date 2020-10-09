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
  createGroup('New group', new Date(), classCode);
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
    <div>
      {show && (
        <div
          className={styles.AddGroupTags}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
        >
          {classes.map(({ name, classId, color }): ReactElement | undefined => (
            <div key={name}>
              {classId !== null && (
                <button
                  type="button"
                  className={styles.ClassItem}
                  onClick={() => newGroup(name.split(':')[0])}
                >
                  <div className={styles.Color} style={{ backgroundColor: color }}>
                    {' '}
                  </div>
                  <p>{name.split(':')[0]}</p>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
