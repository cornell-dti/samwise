// @flow strict

import React from 'react';
import type { Node } from 'react';
import { Icon } from 'semantic-ui-react';
import Calendar from 'react-calendar';
import { connect } from 'react-redux';
import ClassPicker from '../ClassPicker/ClassPicker';
import CheckBox from '../UI/CheckBox';
import type { SimpleMainTask } from './task-editors-types';
import type { RemoveTaskAction } from '../../store/action-types';
import { removeTask as removeTaskAction } from '../../store/actions';
import styles from './TaskEditor.css';

type Props = {|
  ...SimpleMainTask;
  +focused: boolean;
  +editTask: (task: SimpleMainTask) => void;
  +removeTask: (taskId: number, undoable?: boolean) => RemoveTaskAction;
  +onFocusChange: (focused: boolean) => void;
|};

type State = {|
  doesShowTagEditor: boolean;
  doesShowCalendarEditor: boolean;
|};

/**
 * InternalMainTaskEditor is intended for internal use for TaskEditor only.
 */
class InternalMainTaskEditor extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { doesShowTagEditor: false, doesShowCalendarEditor: false };
  }

  /*
   * --------------------------------------------------------------------------------
   * Part 1: Focus Methods
   * --------------------------------------------------------------------------------
   */

  componentDidMount() {
    this.handlePotentialFocusChange();
  }

  componentDidUpdate() {
    this.handlePotentialFocusChange();
  }

  /**
   * Handle a potential focus change when the user switch between inputs.
   */
  handlePotentialFocusChange = (): void => {
    const e = this.inputElement;
    const { focused } = this.props;
    if (e != null) {
      if (focused) {
        e.focus();
      } else {
        e.blur();
      }
    }
  };

  /**
   * Handle a potential cancel focus request when the user press some key, which
   * may be ENTER, in which case we want to shift focus to the next input element.
   *
   * @param {KeyboardEvent} event the keyboard event to check.
   */
  cancelFocus = (event: KeyboardEvent): void => {
    const inputTarget = event.target;
    if (inputTarget instanceof HTMLInputElement) {
      const { onFocusChange } = this.props;
      if (event.key !== 'Enter' && event.key !== 'Tab') {
        onFocusChange(true);
      } else {
        inputTarget.blur();
        onFocusChange(false);
      }
    }
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 2: Toggle Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * Toggle the editor for the tag of the task.
   */
  toggleTagEditor = (): void => {
    this.setState((state: State) => ({
      doesShowTagEditor: !state.doesShowTagEditor, doesShowCalendarEditor: false,
    }));
  };

  /**
   * Toggle the editor of the deadline of the task.
   */
  toggleDateEditor = (): void => {
    this.setState((state: State) => ({
      doesShowTagEditor: false, doesShowCalendarEditor: !state.doesShowCalendarEditor,
    }));
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 3: Editor Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * Change the name of the task.
   *
   * @param {*} event the event to notify the name change.
   */
  editTaskName = (event: SyntheticEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const name = event.currentTarget.value;
    const {
      focused, editTask, removeTask, onFocusChange, ...task
    } = this.props;
    editTask({ ...task, name });
  };

  /**
   * Toggle the completion status of the task.
   */
  editComplete = (): void => {
    const {
      focused, editTask, removeTask, onFocusChange, ...task
    } = this.props;
    editTask({ ...task, complete: !task.complete });
  };

  /**
   * Change the in-focus status of the task.
   */
  editInFocus = (): void => {
    const {
      focused, editTask, removeTask, onFocusChange, ...task
    } = this.props;
    editTask({ ...task, inFocus: !task.inFocus });
  };

  /**
   * Edit the tag of the task.
   *
   * @param {string} tag the new tag.
   */
  editTaskTag = (tag: string): void => {
    const {
      focused, editTask, removeTask, onFocusChange, ...task
    } = this.props;
    editTask({ ...task, tag });
    this.setState({ doesShowTagEditor: false });
  };

  /**
   * Edit the new date of the task.
   *
   * @param {string} dateString the new date in string.
   */
  editTaskDate = (dateString: string): void => {
    const {
      focused, editTask, removeTask, onFocusChange, ...task
    } = this.props;
    editTask({ ...task, date: new Date(dateString) });
    this.setState({ doesShowCalendarEditor: false });
  };

  /**
   * Remove the task.
   */
  removeTask = (): void => {
    const { id, removeTask } = this.props;
    removeTask(id, true);
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 4: Render Methods
   * --------------------------------------------------------------------------------
   */

  inputElement: ?HTMLInputElement;

  /**
   * Return the rendered header element.
   */
  renderHeader(): Node {
    const { tag, date } = this.props;
    const {
      doesShowTagEditor, doesShowCalendarEditor,
    } = this.state;
    const headerClassNames = `${styles.TaskEditorFlexibleContainer} ${styles.TaskEditorHeader}`;
    const tagPickerElementOpt = doesShowTagEditor && (
      <div className={styles.TaskEditorTagEditor}>
        <ClassPicker onTagChange={this.editTaskTag} />
      </div>
    );
    const calendarElementOpt = doesShowCalendarEditor && (
      <Calendar
        value={date}
        className={styles.TaskEditorCalendar}
        minDate={new Date()}
        onChange={this.editTaskDate}
      />
    );
    return (
      <div className={headerClassNames}>
        <button type="button" className={styles.TaskEditorTag} onClick={this.toggleTagEditor}>
          {tag}
        </button>
        {tagPickerElementOpt}
        <span className={styles.TaskEditorFlexiblePadding} />
        <Icon
          name="calendar"
          className={styles.TaskEditorIconButton}
          onClick={this.toggleDateEditor}
        />
        <span>{`${date.getMonth() + 1}/${date.getDate()}`}</span>
        {calendarElementOpt}
      </div>
    );
  }

  /**
   * Return the rendered main task text editor element.
   */
  renderMainTaskEdit(): Node {
    const { name, complete, inFocus } = this.props;
    return (
      <div className={styles.TaskEditorFlexibleContainer}>
        <CheckBox
          className={styles.TaskEditorCheckBox}
          checked={complete}
          onChange={this.editComplete}
        />
        <input
          className={styles.TaskEditorFlexibleInput}
          placeholder="Main Task"
          value={name}
          ref={(e) => { this.inputElement = e; }}
          onKeyDown={this.cancelFocus}
          onChange={this.editTaskName}
        />
        <Icon
          name={inFocus ? 'bookmark' : 'bookmark outline'}
          className={styles.TaskEditorIcon}
          onClick={this.editInFocus}
        />
        <Icon className={styles.TaskEditorIcon} name="delete" onClick={this.removeTask} />
      </div>
    );
  }

  render(): Node {
    return (
      <div>
        {this.renderHeader()}
        {this.renderMainTaskEdit()}
      </div>
    );
  }
}

const ConnectedInternalMainTaskEditor = connect(
  null, { removeTask: removeTaskAction },
)(InternalMainTaskEditor);
export default ConnectedInternalMainTaskEditor;
