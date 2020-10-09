import React from 'react';
import { Tag } from 'common/types/store-types';
import { store } from '../../store/store';
import styles from './AddGroupTags.module.scss';

type AddGroupTagsProps = {
  readonly show: boolean;
  readonly setShow: (show: boolean) => void;
};

export default function AddGroupTags({ show, setShow }: AddGroupTagsProps): React.ReactElement {
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
          {classes.map((t): React.ReactElement | undefined => (
            <div key={t.name}>
              {t.classId !== null && (
                <div className={styles.ClassItem}>
                  <div className={styles.Color} style={{ backgroundColor: t.color }}>
                    {' '}
                  </div>
                  <p>{t.name.split(':')[0]}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
