import React from 'react';
import { Tag } from 'common/lib/types/store-types';

type Props = {
  readonly tags: Map<string, Tag>;
};
export default function AddGroupTags({ tags }: Props): React.ReactElement {
  const classCodes: string[] = [];
  tags.forEach((t) => {
    if (t.classId !== null) {
      classCodes.push(t.name.split(':')[0]);
    }
  });
  return (
    <div>
      {
        classCodes.map((t: string) => (
          <p key={t}>{t}</p>
        ))
      }
    </div>
  );
}
