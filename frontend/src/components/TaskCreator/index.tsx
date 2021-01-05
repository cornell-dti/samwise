import React, {
  KeyboardEvent,
  SyntheticEvent,
  ReactElement,
  useState,
  useRef,
  createContext,
  ReactNode,
  useContext,
} from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { randomId } from 'common/util/general-util';
import {
  Task,
  RepeatingDate,
  SamwiseUserProfile,
  SubTask,
  State as StoreState,
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
  readonly member?: readonly SamwiseUserProfile[];
  readonly date: Date | RepeatingDate;
  readonly subTasks: SubTask[];
  readonly tagPickerOpened: boolean;
  readonly datePickerOpened: boolean;
  readonly datePicked: boolean;
  readonly needToSwitchFocus: boolean;
};

type Props = { readonly view: 'personal' | 'group' };

/**
 * The placeholder text in the main task input box.
 */
const PLACEHOLDER_TEXT = 'What do you have to do?';

type TaskCreatorContextMutableValues = {
  readonly taskCreatorOpened?: boolean;
  readonly assignedMembers?: readonly SamwiseUserProfile[];
};

type TaskCreatorContextValues = TaskCreatorContextMutableValues & {
  readonly group?: string;
  readonly groupClassCode?: string;
  readonly groupMemberProfiles?: readonly SamwiseUserProfile[];
  readonly setTaskCreatorContext: React.Dispatch<
    React.SetStateAction<TaskCreatorContextMutableValues>
  >;
};

const TaskCreatorContext = createContext<TaskCreatorContextValues>({
  setTaskCreatorContext: () => {
    throw new Error("Shouldn't be called");
  },
});

type TaskCreatorContextProviderProps = {
  readonly group?: string;
  readonly groupClassCode?: string;
  readonly groupMemberProfiles?: readonly SamwiseUserProfile[];
  readonly children: ReactNode;
};

export const TaskCreatorContextProvider = ({
  group,
  groupClassCode,
  groupMemberProfiles,
  children,
}: TaskCreatorContextProviderProps): ReactElement => {
  const [state, setState] = useState<TaskCreatorContextMutableValues>({});

  return (
    <TaskCreatorContext.Provider
      value={{
        ...state,
        group,
        groupClassCode,
        groupMemberProfiles,
        setTaskCreatorContext: setState,
      }}
    >
      {children}
    </TaskCreatorContext.Provider>
  );
};

export const useTaskCreatorContextSetter = (): React.Dispatch<
  React.SetStateAction<TaskCreatorContextMutableValues>
> => useContext(TaskCreatorContext).setTaskCreatorContext;

export const TaskCreator = ({ view }: Props): ReactElement => {
  const {
    group,
    groupClassCode,
    groupMemberProfiles,
    taskCreatorOpened,
    assignedMembers,
    setTaskCreatorContext,
  } = useContext(TaskCreatorContext);

  const theme = useSelector((state: StoreState) => state.settings.theme);

  const initialState = (): State => ({
    id: randomId(),
    owner: [''],
    name: '',
    tag: groupClassCode ?? NONE_TAG_ID,
    member: undefined,
    date: new Date(),
    complete: false,
    inFocus: false,
    subTasks: [],
    tagPickerOpened: false,
    datePickerOpened: false,
    datePicked: false,
    needToSwitchFocus: false,
  });

  const [state, setState] = useState(initialState);
  const setPartialState = (partial: Partial<State>): void =>
    setState((prev) => ({ ...prev, ...partial }));

  const addTaskRef = useRef<HTMLInputElement | null>(null);

  const darkModeStyle = theme === 'dark' ? { background: 'black', color: 'white' } : undefined;

  /*
   * --------------------------------------------------------------------------------
   * Part 1: Openers & Closers
   * --------------------------------------------------------------------------------
   */

  const openNewTask = (): void =>
    setTaskCreatorContext((prev) => ({ ...prev, taskCreatorOpened: true }));

  const closeNewTask = (): void => {
    setTaskCreatorContext((prev) => ({ ...prev, taskCreatorOpened: false }));
  };

  /**
   * Open the tag picker and close the date picker.
   */
  const openTagPicker = (): void =>
    setState((prev) => ({
      ...prev,
      tagPickerOpened: !prev.tagPickerOpened,
      datePickerOpened: false,
    }));

  /**
   * Open the date picker and close the tag picker.
   */
  const openDatePicker = (): void =>
    setState((prev) => ({
      ...prev,
      datePickerOpened: !prev.datePickerOpened,
      tagPickerOpened: false,
    }));

  /*
   * --------------------------------------------------------------------------------
   * Part 2: Manager functions when finished editing.
   * --------------------------------------------------------------------------------
   */

  const focusTaskName = (): void => {
    const addTaskElement = addTaskRef.current;
    if (addTaskElement) {
      addTaskElement.focus();
    }
  };

  const handleSave = (e?: SyntheticEvent<HTMLElement>): void => {
    if (e != null) {
      e.preventDefault();
    }
    let { owner } = state;
    const { member, name, tag, date, complete, inFocus, subTasks } = state;

    if (name === '') {
      return;
    }

    const selectedMembers = member || assignedMembers;
    if (selectedMembers) {
      const newOwners = selectedMembers.map((profile) => profile.email);
      owner = newOwners;
    }

    const newSubTasks = subTasks.filter((subTask) => subTask.name !== ''); // remove empty subtasks
    // Put task in focus is the due date is today.
    const autoInFocus = inFocus || (date instanceof Date && isToday(date));
    const commonTask = {
      owner,
      name,
      tag: groupClassCode ?? tag,
      date,
      complete,
      inFocus: autoInFocus,
    };
    let newTask: TaskWithoutIdOrderChildren;
    if (date instanceof Date) {
      date.setHours(23);
      date.setMinutes(59);
      date.setSeconds(59);
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
    setState({ ...initialState() });
    closeNewTask();
    const addTaskElement = addTaskRef.current;
    if (addTaskElement) {
      addTaskElement.blur();
    }
  };

  /*
   * --------------------------------------------------------------------------------
   * Part 3: Various Editors
   * --------------------------------------------------------------------------------
   */

  const editTaskName = (e: SyntheticEvent<HTMLInputElement>): void => {
    setPartialState({ name: e.currentTarget.value });
    focusTaskName();
  };

  const editTag = (tag: string): void => {
    setPartialState({ tag, tagPickerOpened: false });
    focusTaskName();
  };

  const editMember = (member?: readonly SamwiseUserProfile[]): void => {
    setPartialState({ member, tagPickerOpened: false });
    focusTaskName();
  };

  /**
   * Edit the date.
   *
   * @param {Date} date the new date, or null for cancel.
   */
  const editDate = (date: Date | RepeatingDate | null): void => {
    const { datePicked } = state;
    if (datePicked && date === null) {
      // User cancelled, but date was already picked
      setPartialState({ datePickerOpened: false });
      focusTaskName();
    } else if (date instanceof Date || date === null) {
      // Selecting a date, or user cancelled while date was not picked
      setPartialState({
        date: date ?? new Date(),
        datePickerOpened: false,
        datePicked: Boolean(date),
      });
      focusTaskName();
    } else {
      // Repeating task
      setPartialState({ date, datePickerOpened: false, datePicked: true });
      focusTaskName();
    }
  };

  const clearDate = (): void => {
    setPartialState({ date: new Date(), datePickerOpened: false, datePicked: false });
    focusTaskName();
  };

  const togglePin = (inFocus: boolean): void => {
    setPartialState({ inFocus });
    focusTaskName();
  };

  const addNewSubTask = (e: SyntheticEvent<HTMLInputElement>): void => {
    const newSubTaskName = e.currentTarget.value;
    if (newSubTaskName === '') {
      return;
    }
    setState((prev) => ({
      ...prev,
      subTasks: [
        ...prev.subTasks,
        {
          order: prev.subTasks.reduce((acc, s) => Math.max(acc, s.order), 0) + 1,
          name: newSubTaskName,
          complete: false,
          inFocus: false,
        },
      ],
      needToSwitchFocus: true,
    }));
  };

  const newSubTaskKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Tab') {
      closeNewTask();
    }
  };

  const editSubTask = (subTask: SubTask) => (e: SyntheticEvent<HTMLInputElement>) => {
    const name = e.currentTarget.value;
    setState((prev) => ({
      ...prev,
      subTasks: prev.subTasks.map((s) => (subTasksEqual(s, subTask) ? { ...s, name } : s)),
    }));
  };

  const submitSubTask = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const deleteSubTask = (subTask: SubTask) => (e: SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setState((prev) => ({
      ...prev,
      subTasks: prev.subTasks.filter((s) => !subTasksEqual(s, subTask)),
    }));
  };

  const resetTask = (): void => {
    setState({ ...initialState() });
    setTaskCreatorContext((prev) => ({ ...prev, taskCreatorOpened: false }));
    focusTaskName();
  };

  const render = (): ReactElement => {
    const { name, tag, member, date, inFocus, subTasks, datePicked, needToSwitchFocus } = state;
    if (!taskCreatorOpened) {
      return (
        <div className={clsx(styles.TaskCreator, styles.TaskCreatorClosed)} style={darkModeStyle}>
          <form
            className={clsx(styles.NewTaskWrap, groupMemberProfiles && styles.GroupTaskWrap)}
            onSubmit={handleSave}
            onFocus={openNewTask}
          >
            <input
              required
              type="text"
              value={name}
              onChange={editTaskName}
              className={styles.NewTaskComponent}
              placeholder={PLACEHOLDER_TEXT}
              style={darkModeStyle}
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
          setPartialState({ needToSwitchFocus: false });
        }
      };

      const { order, name: subtaskName } = thisSubTask;
      return (
        <li key={order} className={styles.ExistingSubTaskRow}>
          <button
            className={styles.DeleteSubTaskButton}
            type="button"
            tabIndex={-1}
            onClick={deleteSubTask(thisSubTask)}
          >
            <SamwiseIcon iconName="x-dark" />
          </button>
          <input
            type="text"
            className={styles.ExistingSubTaskInput}
            ref={refHandler}
            value={subtaskName}
            onChange={editSubTask(thisSubTask)}
            onKeyDown={submitSubTask}
            style={darkModeStyle}
          />
        </li>
      );
    };

    return (
      <div className={styles.TaskCreator} style={darkModeStyle}>
        <div onClick={closeNewTask} role="presentation" className={styles.CloseNewTask} />
        <div className={styles.TaskCreatorOpenedPlaceHolder} />
        <form
          className={clsx(styles.NewTaskWrap, styles.NewTaskModal)}
          onSubmit={handleSave}
          onFocus={openNewTask}
        >
          <div className={clsx(styles.TaskCreatorRow, styles.FirstRow)}>
            <div className={styles.TitleText}>Add Task</div>
            {date instanceof Date && <FocusPicker pinned={inFocus} onPinChange={togglePin} />}
            <div className={styles.TagPickWrap}>
              {view === 'personal' ? (
                <TagPicker
                  tag={tag}
                  opened={state.tagPickerOpened}
                  onTagChange={editTag}
                  onPickerOpened={openTagPicker}
                />
              ) : (
                <GroupMemberPicker
                  member={member || assignedMembers}
                  opened={state.tagPickerOpened}
                  onMemberChange={editMember}
                  onPickerOpened={openTagPicker}
                  groupMemberProfiles={groupMemberProfiles || []}
                  clearAssignedMembers={() =>
                    setTaskCreatorContext((prev) => ({ ...prev, assignedMembers: [] }))
                  }
                  resetTask={resetTask}
                />
              )}
            </div>
            <DatePicker
              date={date}
              opened={state.datePickerOpened}
              datePicked={datePicked}
              inGroupView={false}
              onDateChange={editDate}
              onClearPicker={clearDate}
              onPickerOpened={openDatePicker}
            />
          </div>
          <div className={styles.TaskCreatorRow}>
            <input
              required
              type="text"
              value={name}
              onChange={editTaskName}
              className={clsx(styles.NewTaskComponent, styles.NewTaskComponentOpened)}
              ref={addTaskRef}
              style={darkModeStyle}
            />
            <button
              type="submit"
              className={view === 'personal' ? styles.SubmitNewTask : styles.GroupSubmitNewTask}
              style={darkModeStyle}
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
          <div style={darkModeStyle}>
            <div className={styles.SubtasksContainer}>
              <ul className={styles.SubtasksList}>{subTasks.map(existingSubTaskEditor)}</ul>
              <SamwiseIcon iconName="edit" containerClassName={styles.EditIcon} tabIndex={-1} />
              <input
                className={styles.SubtaskInput}
                type="text"
                placeholder="Add a Subtask"
                value=""
                onChange={addNewSubTask}
                onKeyDown={newSubTaskKeyPress}
                style={darkModeStyle}
              />
            </div>
          </div>
          <button type="button" className={styles.ResetButton} onClick={resetTask}>
            DISCARD TASK
          </button>
        </form>
      </div>
    );
  };

  return render();
};
