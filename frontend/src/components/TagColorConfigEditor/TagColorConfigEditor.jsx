// @flow strict

import React from 'react';
import TagColorConfigItemList from './TagColorConfigItemList';
import TagColorConfigItemAdder from './TagColorConfigItemAdder';

export default function TagColorConfigEditor() {
  return (
    <div>
      <TagColorConfigItemList />
      <TagColorConfigItemAdder />
    </div>
  );
}
