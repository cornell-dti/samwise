// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import Calendar from 'react-calendar';
import styles from '../TaskEditor.css';
import TagListPicker from '../../TagListPicker/TagListPicker';
import type { Tag } from '../../../../store/store-types';

type TagAndDate = {|
  +tag: string;
  +date: Date;
|};

type Props = {|
  ...TagAndDate;
  +onChange: ($Shape<TagAndDate>) => void;
  +getTag: (id: string) => Tag;
|};

type EditorDisplayStatus = {|
  +doesShowTagEditor: boolean;
  +doesShowDateEditor: boolean;
|};

export default function EditorHeader(
  {
    tag, date, onChange, getTag,
  }: Props,
): Node {
  const [editorDisplayStatus, setEditorDisplayStatus] = React.useState<EditorDisplayStatus>({
    doesShowTagEditor: false,
    doesShowDateEditor: false,
  });

  const toggleTagEditor = () => setEditorDisplayStatus(prev => ({
    doesShowTagEditor: !prev.doesShowTagEditor, doesShowDateEditor: false,
  }));
  const toggleDateEditor = () => setEditorDisplayStatus(prev => ({
    doesShowTagEditor: false, doesShowDateEditor: !prev.doesShowDateEditor,
  }));
  const editTaskTag = (t: string): void => {
    onChange({ tag: t });
    setEditorDisplayStatus(prev => ({ ...prev, doesShowTagEditor: false }));
  };
  const editTaskDate = (dateString: string): void => {
    onChange({ date: new Date(dateString) });
    setEditorDisplayStatus(prev => ({ ...prev, doesShowDateEditor: false }));
  };

  const { doesShowTagEditor, doesShowDateEditor } = editorDisplayStatus;
  const headerClassName = `${styles.TaskEditorFlexibleContainer} ${styles.TaskEditorHeader}`;
  const tagDisplay = (
    <button type="button" className={styles.TaskEditorTag} onClick={toggleTagEditor}>
      {getTag(tag).name}
    </button>
  );
  const tagEditor = doesShowTagEditor && (
    <div className={styles.TaskEditorTagEditor}>
      <TagListPicker onTagChange={editTaskTag} />
    </div>
  );
  const dateDisplay = (<span>{`${date.getMonth() + 1}/${date.getDate()}`}</span>);
  const dateEditor = doesShowDateEditor && (
    <Calendar
      value={date}
      className={styles.TaskEditorCalendar}
      minDate={new Date()}
      onChange={editTaskDate}
    />
  );
  return (
    <div className={headerClassName}>
      {tagDisplay}
      {tagEditor}
      <span className={styles.TaskEditorFlexiblePadding} />
      <Icon
        name="calendar"
        className={styles.TaskEditorIconButton}
        onClick={toggleDateEditor}
      />
      {dateDisplay}
      {dateEditor}
    </div>
  );
}
