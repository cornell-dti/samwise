// @flow strict

import type { Node } from 'react';
import * as React from 'react';
import { Icon, Input } from 'semantic-ui-react';
import Calendar from 'react-calendar';
import ClassPicker from '../ClassPicker/ClassPicker';
import CheckBox from '../UI/CheckBox';
import type { SimpleMainTask } from './floating-task-editor-types';
import styles from './FloatingTaskEditor.css';

type Props = {|
  ...SimpleMainTask;
  +focused: boolean;
  +editTask: (task: SimpleMainTask) => void;
  +onFocusChange: (focused: boolean) => void;
|};

type State = {|
  doesShowTagEditor: boolean;
  doesShowCalendarEditor: boolean;
|};

/**
 * InternalMainTaskEditor is intended for internal use for FloatingTaskEditor only.
 */
export default class InternalMainTaskEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { doesShowTagEditor: false, doesShowCalendarEditor: false };
  }

  /*
   * --------------------------------------------------------------------------------
   * Part 1: Focus Methods
   * --------------------------------------------------------------------------------
   */

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
      focused, editTask, onFocusChange, ...task
    } = this.props;
    editTask({ ...task, name });
  };

  /**
   * Toggle the completion status of the task.
   */
  editComplete = (): void => {
    const {
      focused, editTask, onFocusChange, ...task
    } = this.props;
    editTask({ ...task, complete: !task.complete });
  };

  /**
   * Change the in-focus status of the task.
   */
  editInFocus = (): void => {
    const {
      focused, editTask, onFocusChange, ...task
    } = this.props;
    editTask({ ...task, complete: !task.inFocus });
  };

  /**
   * Edit the tag of the task.
   *
   * @param {string} tag the new tag.
   */
  editTaskTag = (tag: string): void => {
    const {
      focused, editTask, onFocusChange, ...task
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
      focused, editTask, onFocusChange, ...task
    } = this.props;
    editTask({ ...task, date: new Date(dateString) });
    this.setState({ doesShowCalendarEditor: false });
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 4: Render Methods
   * --------------------------------------------------------------------------------
   */

  /**
   * Return the rendered header element.
   */
  renderHeader(): Node {
    const { tag, date } = this.props;
    const {
      doesShowTagEditor, doesShowCalendarEditor,
    } = this.state;
    const headerClassNames = `${styles.FloatingTaskEditorFlexibleContainer} ${styles.FloatingTaskEditorHeader}`;
    const tagPickerElementOpt = doesShowTagEditor && (
      <div className={styles.FloatingTaskEditorTagEditor}>
        <ClassPicker onTagChange={this.editTaskTag} />
      </div>
    );
    const calendarElementOpt = doesShowCalendarEditor && (
      <Calendar
        value={date}
        className={styles.FloatingTaskEditorCalendar}
        minDate={new Date()}
        onChange={this.editTaskDate}
      />
    );
    return (
      <div className={headerClassNames}>
        <span className={styles.FloatingTaskEditorTag}>
          <label
            htmlFor="task-tag-editor-checkbox"
            className={styles.FloatingTaskEditorTagLabel}
          >
            <input id="task-tag-editor-checkbox" type="checkbox" />
            {tag}
          </label>
        </span>
        <span className={styles.FloatingTaskEditorFlexiblePadding} />
        <Icon
          name="tag"
          className={styles.FloatingTaskEditorIconButton}
          onClick={this.toggleTagEditor}
        />
        <Icon
          name="calendar"
          className={styles.FloatingTaskEditorIconButton}
          onClick={this.toggleDateEditor}
        />
        {tagPickerElementOpt}
        {calendarElementOpt}
      </div>
    );
  }

  /**
   * Return the rendered main task text editor element.
   */
  renderMainTaskEdit(): Node {
    const { name, complete, focused } = this.props;
    return (
      <div className={styles.FloatingTaskEditorFlexibleContainer}>
        <CheckBox
          className={styles.FloatingTaskEditorCheckBox}
          checked={complete}
          onChange={this.editComplete}
        />
        <Input
          className={styles.FloatingTaskEditorFlexibleInput}
          placeholder="Main Task"
          value={name}
          autoFocus={focused}
          onKeyDown={this.cancelFocus}
          onChange={this.editTaskName}
        />
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
