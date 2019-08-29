import React, { ReactElement } from 'react';
import Calendar from 'react-calendar';
import styles from './index.module.css';
import TagListPicker from '../../TagListPicker/TagListPicker';
import { Tag, RepeatMetaData } from '../../../../store/store-types';
import { CalendarPosition } from '../editors-types';
import SamwiseIcon from '../../../UI/SamwiseIcon';

type TagAndDate = {
  readonly tag: string;
  readonly date: Date | RepeatMetaData;
};

type Props = TagAndDate & {
  readonly onChange: (change: Partial<TagAndDate>) => void;
  readonly getTag: (id: string) => Tag;
  readonly displayGrabber: boolean;
  readonly calendarPosition: CalendarPosition;
};

type EditorDisplayStatus = {
  readonly doesShowTagEditor: boolean;
  readonly doesShowDateEditor: boolean;
};

const calendarIconClass = [styles.TaskEditorIconButton, styles.TaskEditorIcon].join(' ');

export default function EditorHeader(
  { tag, date, onChange, getTag, displayGrabber, calendarPosition }: Props,
): ReactElement {
  const [editorDisplayStatus, setEditorDisplayStatus] = React.useState<EditorDisplayStatus>({
    doesShowTagEditor: false,
    doesShowDateEditor: false,
  });

  const toggleTagEditor = (): void => setEditorDisplayStatus((prev) => ({
    doesShowTagEditor: !prev.doesShowTagEditor, doesShowDateEditor: false,
  }));
  const toggleDateEditor = (): void => setEditorDisplayStatus((prev) => ({
    doesShowTagEditor: false, doesShowDateEditor: !prev.doesShowDateEditor,
  }));
  const editTaskTag = (t: string): void => {
    onChange({ tag: t });
    setEditorDisplayStatus((prev) => ({ ...prev, doesShowTagEditor: false }));
  };
  const editTaskDate = (d: Date | Date[]): void => {
    if (Array.isArray(d)) {
      throw new Error('date is not an arry');
    }
    onChange({ date: d });
    setEditorDisplayStatus((prev) => ({ ...prev, doesShowDateEditor: false }));
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
  const dateDisplay = date instanceof Date
    ? <span>{`${date.getMonth() + 1}/${date.getDate()}`}</span>
    : <span>Repeated</span>;
  const dateEditor = doesShowDateEditor && date instanceof Date && (
    <Calendar
      value={date}
      className={
        calendarPosition === 'top'
          ? styles.TaskEditorCalendarTop
          : styles.TaskEditorCalendarBottom
      }
      minDate={new Date()}
      onChange={editTaskDate}
      calendarType="US"
    />
  );
  return (
    <div className={headerClassName}>
      {displayGrabber && (
        <SamwiseIcon iconName="grabber" className={styles.TaskEditorGrabberIcon} />
      )}
      {tagDisplay}
      {tagEditor}
      <span className={styles.TaskEditorFlexiblePadding} />
      <SamwiseIcon
        iconName="calendar-light"
        className={calendarIconClass}
        style={{ marginRight: '8px' }}
        onClick={toggleDateEditor}
      />
      {dateDisplay}
      {dateEditor}
    </div>
  );
}
