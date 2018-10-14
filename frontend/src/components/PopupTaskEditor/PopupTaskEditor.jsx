// @flow

import * as React from 'react';
import type { Task } from '../../store/store-types';

type Props = Task;

export default function PopupTaskEditor({ id }: Props) {
  return (
    <div>
      Hi! I am the editor for
      {' '}
      {id}
      !
    </div>
  );
}
