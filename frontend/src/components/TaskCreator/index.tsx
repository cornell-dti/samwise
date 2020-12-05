import React, { CSSProperties, KeyboardEvent, SyntheticEvent, ReactElement } from 'react';
import { connect } from 'react-redux';
import { randomId } from 'common/util/general-util';
import {
  Task,
  RepeatingDate,
  SamwiseUserProfile,
  SubTask,
  State as StoreState,
  Theme,
} from 'common/types/store-types';
import { NONE_TAG_ID } from 'common/util/tag-util';
import { isToday } from 'common/util/datetime-util';
import { subTasksEqual } from 'common/util/task-util';
import TagPicker from './TagPicker';
import DatePicker from './DatePicker';
import FocusPicker from './FocusPicker';
import GroupMemberPicker from './GroupMemberPicker';
import { addTask, TaskWithoutIdOrderChildren } from '../../firebase/actions';
import SamwiseIcon from '../UI/SamwiseIcon';
import styles from './index.module.scss';

type SimpleTask = Omit<Task, 'type' | 'order' | 'children' | 'metadata'>;

type State = SimpleTask & {
  readonly owner: readonly string[];
  readonly member?: SamwiseUserProfile;
  readonly date: Date | RepeatingDate;
  readonly subTasks: SubTask[];
  readonly opened: boolean;
  readonly tagPickerOpened: boolean;
  readonly datePickerOpened: boolean;
  readonly datePicked: boolean;
  readonly needToSwitchFocus: boolean;
};

type OwnProps = {
  readonly theme: Theme;
};

type Props = OwnProps & {
  readonly view: string;
  readonly group?: string;
  readonly groupMemberProfiles?: SamwiseUserProfile[];
  readonly taskCreatorOpened?: boolean;
  readonly assignedMember?: SamwiseUserProfile;
  readonly clearAssignedMember?: () => void;
};

/**
 * The placeholder text in the main task input box.
 */
const PLACEHOLDER_TEXT = 'What do you have to do?';
/**
 * Generate the initial state.
 */
const initialState = (): State => ({
  id: randomId(),
  owner: [''],
  name: '',
  tag: NONE_TAG_ID, // the id of the None tag.
  member: undefined,
  date: new Date(),
  complete: false,
  inFocus: false,
  subTasks: [],
  opened: false,
  tagPickerOpened: false,
  datePickerOpened: false,
  datePicked: false,
  needToSwitchFocus: false,
});

export class TaskCreator extends React.PureComponent<Props, State> {
  public readonly state: State = initialState();

  private addTask: HTMLInputElement | null | undefined;

  private get isOpen(): boolean {
    // eslint-disable-next-line react/destructuring-assignment
    return this.state.opened || this.props.taskCreatorOpened || false;
  }

  private get darkModeStyle(): CSSProperties | undefined {
    const { theme } = this.props;
    return theme === 'dark' ? { background: 'black', color: 'white' } : undefined;
  }

  /*
   * --------------------------------------------------------------------------------
   * Part 1: Openers & Closers
   * --------------------------------------------------------------------------------
   */

  private openNewTask = (): void => this.setState({ opened: true });

  private closeNewTask = (): void => this.setState({ opened: false });

  /**
   * Open the tag picker and close the date picker.
   */
  private openTagPicker = (): void =>
    this.setState(({ tagPickerOpened }: State) => ({
      tagPickerOpened: !tagPickerOpened,
      datePickerOpened: false,
    }));

  /**
   * Open the date picker and close the tag picker.
   */
  private openDatePicker = (): void =>
    this.setState(({ datePickerOpened }: State) => ({
      datePickerOpened: !datePickerOpened,
      tagPickerOpened: false,
    }));

  /*
   * --------------------------------------------------------------------------------
   * Part 2: Manager functions when finished editing.
   * --------------------------------------------------------------------------------
   */

  private focusTaskName = (): void => {
    if (this.addTask) {
      this.addTask.focus();
    }
  };

  private handleSave = (e?: SyntheticEvent<HTMLElement>): void => {
    if (e != null) {
      e.preventDefault();
    }
    const { owner, name, tag, date, complete, inFocus, subTasks } = this.state;
    if (name === '') {
      return;
    }
    const newSubTasks = subTasks.filter((subTask) => subTask.name !== ''); // remove empty subtasks
    // Put task in focus is the due date is today.
    const autoInFocus = inFocus || (date instanceof Date && isToday(date));
    const commonTask = { owner, name, tag, date, complete, inFocus: autoInFocus };
    let newTask: TaskWithoutIdOrderChildren;
    if (date instanceof Date) {
      date.setHours(23);
      date.setMinutes(59);
      date.setSeconds(59);
      const { view, group } = this.props;
      if (view === 'group' && typeof group === 'string') {
        newTask = { ...commonTask, metadata: { type: 'GROUP', date, group } };
      } else {
        newTask = { ...commonTask, metadata: { type: 'ONE_TIME', date } };
      }
    } else {
      newTask = {
        ...commonTask,
        inFocus: false,
        metadata: {
          type: 'MASTER_TEMPLATE',
          forks: [],
          date,
        },
      };
    }
    // Add the task to the store.
    addTask(owner, newTask, newSubTasks);
    // Reset the state.
    this.setState({ ...initialState() });
    this.closeNewTask();
    if (this.addTask) {
      this.addTask.blur();
    }
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 3: Various Editors
   * --------------------------------------------------------------------------------
   */

  private editTaskName = (e: SyntheticEvent<HTMLInputElement>): void =>
    this.setState({ name: e.currentTarget.value }, this.focusTaskName);

  private editTag = (tag: string): void =>
    this.setState({ tag, tagPickerOpened: false }, this.focusTaskName);

  private editMember = (member?: SamwiseUserProfile): void =>
    this.setState({ member, tagPickerOpened: false }, this.focusTaskName);

  /**
   * Edit the date.
   *
   * @param {Date} date the new date, or null for cancel.
   */
  private editDate = (date: Date | RepeatingDate | null): void => {
    const { datePicked } = this.state;
    if (datePicked && date === null) {
      // User cancelled, but date was already picked
      this.setState({ datePickerOpened: false }, this.focusTaskName);
    } else if (date instanceof Date || date === null) {
      // Selecting a date, or user cancelled while date was not picked
      this.setState(
        {
          date: date ?? new Date(),
          datePickerOpened: false,
          datePicked: Boolean(date),
        },
        this.focusTaskName
      );
    } else {
      // Repeating task
      this.setState(
        {
          date,
          datePickerOpened: false,
          datePicked: true,
        },
        this.focusTaskName
      );
    }
  };

  private clearDate = (): void => {
    this.setState(
      { date: new Date(), datePickerOpened: false, datePicked: false },
      this.focusTaskName
    );
  };

  private togglePin = (inFocus: boolean): void => this.setState({ inFocus }, this.focusTaskName);

  private addNewSubTask = (e: SyntheticEvent<HTMLInputElement>): void => {
    const newSubTaskName = e.currentTarget.value;
    if (newSubTaskName === '') {
      return;
    }
    this.setState(({ subTasks }: State) => ({
      subTasks: [
        ...subTasks,
        {
          order: subTasks.reduce((acc, s) => Math.max(acc, s.order), 0) + 1,
          name: newSubTaskName,
          complete: false,
          inFocus: false,
        },
      ],
      needToSwitchFocus: true,
    }));
  };

  private newSubTaskKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Tab') {
      this.closeNewTask();
    }
  };

  private editSubTask = (subTask: SubTask) => (e: SyntheticEvent<HTMLInputElement>) => {
    const name = e.currentTarget.value;
    this.setState(({ subTasks }: State) => ({
      subTasks: subTasks.map((s) => (subTasksEqual(s, subTask) ? { ...s, name } : s)),
    }));
  };

  private submitSubTask = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      this.handleSave();
    }
  };

  private deleteSubTask = (subTask: SubTask) => (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    this.setState(({ subTasks }: State) => ({
      subTasks: subTasks.filter((s) => !subTasksEqual(s, subTask)),
    }));
  };

  private resetTask = (): void => this.setState({ ...initialState() }, this.focusTaskName);

  public render(): ReactElement {
    const { view, groupMemberProfiles, assignedMember, clearAssignedMember } = this.props;
    const {
      name,
      tag,
      member,
      date,
      inFocus,
      subTasks,
      tagPickerOpened,
      datePickerOpened,
      datePicked,
      needToSwitchFocus,
    } = this.state;
    if (!this.isOpen) {
      return (
        <div
          className={`${styles.TaskCreator} ${styles.TaskCreatorClosed}`}
          style={this.darkModeStyle}
        >
          <form
            className={`${styles.NewTaskWrap} ${groupMemberProfiles ? styles.GroupTaskWrap : ''}`}
            onSubmit={this.handleSave}
            onFocus={this.openNewTask}
          >
            <input
              required
              type="text"
              value={name}
              onChange={this.editTaskName}
              className={styles.NewTaskComponent}
              placeholder={PLACEHOLDER_TEXT}
              style={this.darkModeStyle}
            />
          </form>
        </div>
      );
    }

    const existingSubTaskEditor = (
      thisSubTask: SubTask,
      i: number,
      arr: SubTask[]
    ): ReactElement => {
      const refHandler = (inputElementRef: HTMLInputElement | null): void => {
        if (i === arr.length - 1 && needToSwitchFocus && inputElementRef != null) {
          inputElementRef.focus();
          this.setState({ needToSwitchFocus: false });
        }
      };

      const { order, name: subtaskName } = thisSubTask;
      return (
        <li key={order} className={styles.ExistingSubTaskRow}>
          <button
            className={styles.DeleteSubTaskButton}
            type="button"
            tabIndex={-1}
            onClick={this.deleteSubTask(thisSubTask)}
          >
            <SamwiseIcon iconName="x-dark" />
          </button>
          <input
            type="text"
            className={styles.ExistingSubTaskInput}
            ref={refHandler}
            value={subtaskName}
            onChange={this.editSubTask(thisSubTask)}
            onKeyDown={this.submitSubTask}
            style={this.darkModeStyle}
          />
        </li>
      );
    };

    return (
      <div className={styles.TaskCreator} style={this.darkModeStyle}>
        <div onClick={this.closeNewTask} role="presentation" className={styles.CloseNewTask} />
        <div className={styles.TaskCreatorOpenedPlaceHolder} />
        <form
          className={`${styles.NewTaskWrap} ${styles.NewTaskModal}`}
          onSubmit={this.handleSave}
          onFocus={this.openNewTask}
        >
          <div className={`${styles.TaskCreatorRow} ${styles.FirstRow}`}>
            <div className={styles.TitleText}>Add Task</div>
            {date instanceof Date && <FocusPicker pinned={inFocus} onPinChange={this.togglePin} />}
            <div className={styles.TagPickWrap}>
              {view === 'personal' ? (
                <TagPicker
                  tag={tag}
                  opened={tagPickerOpened}
                  onTagChange={this.editTag}
                  onPickerOpened={this.openTagPicker}
                />
              ) : (
                <GroupMemberPicker
                  member={assignedMember || member}
                  opened={tagPickerOpened}
                  onMemberChange={this.editMember}
                  onPickerOpened={this.openTagPicker}
                  groupMemberProfiles={groupMemberProfiles || []}
                  clearAssignedMember={clearAssignedMember}
                />
              )}
            </div>
            <DatePicker
              date={date}
              opened={datePickerOpened}
              datePicked={datePicked}
              inGroupView={false}
              onDateChange={this.editDate}
              onClearPicker={this.clearDate}
              onPickerOpened={this.openDatePicker}
            />
          </div>
          <div className={styles.TaskCreatorRow}>
            <input
              required
              type="text"
              value={name}
              onChange={this.editTaskName}
              className={`${styles.NewTaskComponent} ${styles.NewTaskComponentOpened}`}
              ref={(e) => {
                this.addTask = e;
              }}
              style={this.darkModeStyle}
            />
            <button
              type="submit"
              className={view === 'personal' ? styles.SubmitNewTask : styles.GroupSubmitNewTask}
              style={this.darkModeStyle}
            >
              <SamwiseIcon iconName="add-task" />
            </button>
          </div>
          <div className={styles.SubtitleText}>
            <b>Add Subtasks</b>
            &nbsp;(optional)
          </div>
          <div className={styles.DescText}>
            Add optional subtasks to break down your tasks into more manageable pieces.
          </div>
          <div style={this.darkModeStyle}>
            <div className={styles.SubtasksContainer}>
              <ul className={styles.SubtasksList}>{subTasks.map(existingSubTaskEditor)}</ul>
              <SamwiseIcon iconName="edit" containerClassName={styles.EditIcon} tabIndex={-1} />
              <input
                className={styles.SubtaskInput}
                type="text"
                placeholder="Add a Subtask"
                value=""
                onChange={this.addNewSubTask}
                onKeyDown={this.newSubTaskKeyPress}
                style={this.darkModeStyle}
              />
            </div>
          </div>
          <button type="button" className={styles.ResetButton} onClick={this.resetTask}>
            DISCARD TASK
          </button>
        </form>
      </div>
    );
  }
}

const Connected = connect(({ settings: { theme } }: StoreState): OwnProps => ({ theme }))(
  TaskCreator
);
export default Connected;
