// @flow strict

import type {
  Action,
  EditMainTaskAction,
  EditSubTaskAction,
  EditTaskAction,
  RemoveTaskAction,
  RemoveSubTaskAction, AddNewSubTaskAction,
} from './action-types';
import type {
  State, SubTask, Tag, Task,
} from './store-types';
import { emitUndoRemoveTaskToast } from '../util/toast-util';
import {
  httpAddTask,
  httpDeleteTag,
  httpDeleteTask, httpEditMainTask,
  httpEditSubTask,
  httpEditTag,
  httpEditTask, httpNewSubTask,
  httpNewTag,
} from '../http/http-service';
import { dispatchAction } from './store';
import {
  backendPatchExistingTask as backendPatchExistingTaskAction, backendPatchNewSubTask,
  backendPatchNewTag,
  backendPatchNewTask as backendPatchNewTaskAction,
} from './actions';
import { NONE_TAG_ID } from '../util/constants';
import { replaceTask, replaceSubTaskWithinMainTask } from '../util/task-util';

const defaultNoneTag: Tag = {
  id: NONE_TAG_ID, type: 'other', name: 'None', color: 'gray',
};

/**
 * Returns the initial state given an app user.
 *
 * @param {AppUser} appUser the user of the app.
 * @return {State} the initial state of the application.
 */
const initialState: State = {
  mainTaskArray: [],
  tags: [
    defaultNoneTag,
    {
      id: 0, type: 'other', name: 'Personal', color: '#9D4AA9',
    },
    {
      id: 1, type: 'other', name: 'Project Team', color: '#FF8A8A',
    },
    {
      id: 2, type: 'class', name: 'CS1110', color: 'red',
    },
  ],
  bearStatus: 'neutral',
  undoCache: { lastDeletedTask: null },
};

// function to update the bear's status
// eslint-disable-next-line no-unused-vars
function recalculateBearStatus(focusTaskArray) {
  if (focusTaskArray.isComplete) {
    return 'happy';
  }
  if (focusTaskArray.justFinishedTask) {
    return 'has fish';
  }
  if (focusTaskArray.howComplete < 0.1) {
    return 'hungry';
  }
  if (focusTaskArray.hasOverDueTask === 1) {
    return 'hibernating';
  }
  if (focusTaskArray.isAllOverDue || focusTaskArray.hasOverDueTask >= 1) {
    return 'leaving';
  }
  return 'neutral';
}

/**
 * Add a new task.
 *
 * @param {Task[]} mainTaskArray the main task array to modify.
 * @param {Task} newTask the new task.
 * @return {Task[]} the new task array.
 */
function addTask(mainTaskArray: Task[], newTask: Task): Task[] {
  httpAddTask(newTask).then(t => dispatchAction(backendPatchNewTaskAction(newTask.id, t)));
  return [...mainTaskArray, newTask];
}

/**
 * Add a new subtask.
 *
 * @param {Task[]} mainTaskArray the main task array to modify.
 * @param {number} taskId the main task id.
 * @param {SubTask} subTask the subtask to add.
 * @return {Task[]} the new task array.
 */
function addSubTask(mainTaskArray: Task[], { taskId, subTask }: AddNewSubTaskAction): Task[] {
  return replaceTask(mainTaskArray, taskId, (task: Task) => {
    httpNewSubTask(task, subTask).then(backendSubTask => dispatchAction(
      backendPatchNewSubTask(taskId, subTask.id, backendSubTask),
    ));
    return { ...task, subtaskArray: [...task.subtaskArray, subTask] };
  });
}

/**
 * Edit the main task.
 *
 * @param {Task[]} mainTaskArray the main task array to modify.
 * @param {number} taskId the main task id.
 * @param {PartialMainTask} partialMainTask partial information of main task to edit.
 * @return {Task[]} the new task array with the specified task edited.
 */
function editMainTask(
  mainTaskArray: Task[], { taskId, partialMainTask }: EditMainTaskAction,
): Task[] {
  return replaceTask(mainTaskArray, taskId, (task: Task) => {
    const newTask = { ...task, ...partialMainTask };
    const { id, subtaskArray, ...mainTask } = newTask;
    httpEditMainTask(taskId, mainTask).then(() => {});
    return newTask;
  });
}

/**
 * Edit the subtask.
 *
 * @param {Task[]} mainTaskArray the main task array to modify.
 * @param {number} taskId the main task id.
 * @param {number} subtaskId the subtask id.
 * @param {PartialSubTask} partialMainTask partial information of main task to edit.
 * @return {Task[]} the new task array with the specified task edited.
 */
function editSubTask(
  mainTaskArray: Task[], { taskId, subtaskId, partialSubTask }: EditSubTaskAction,
): Task[] {
  return replaceSubTaskWithinMainTask(mainTaskArray, taskId, subtaskId, (subTask, mainTask) => {
    const newSubTask = { ...subTask, ...partialSubTask };
    httpEditSubTask(mainTask, subTask).then(() => {});
    return newSubTask;
  });
}

/**
 * The reducer for remove a main task.
 *
 * @param {State} prevState the previous state.
 * @param {RemoveTaskAction} action the action of removing task.
 * @return {[Task[], Task | null]} the new task array with the specified task remove.
 */
function removeTaskReducer(prevState: State, action: RemoveTaskAction): State {
  let lastDeletedTask: Task | null = null;
  const { taskId, undoable } = action;
  httpDeleteTask(taskId).then(() => {});
  const mainTaskArray = prevState.mainTaskArray.filter((task: Task) => {
    if (task.id !== taskId) {
      return true;
    }
    lastDeletedTask = task;
    return false;
  });
  if (undoable) {
    const undoCache = { ...prevState.undoCache, lastDeletedTask };
    if (lastDeletedTask != null) {
      emitUndoRemoveTaskToast(lastDeletedTask);
    }
    return { ...prevState, mainTaskArray, undoCache };
  }
  const undoCache = { ...prevState.undoCache, lastDeletedTask: null };
  return { ...prevState, mainTaskArray, undoCache };
}

/**
 * Remove a subtask.
 *
 * @param {Task[]} mainTaskArray the main task array to modify.
 * @param {number} taskId id of the parent task of the subtask.
 * @param {number} subtaskId the id of the subtask.
 * @return {Task[]} the new task array with the specified subtask removed.
 */
function removeSubtask(mainTaskArray: Task[], { taskId, subtaskId }: RemoveSubTaskAction): Task[] {
  return replaceTask(mainTaskArray, taskId, (task: Task) => ({
    ...task,
    subtaskArray: task.subtaskArray.filter((subTask: SubTask) => {
      if (subTask.id !== subtaskId) {
        return true;
      }
      httpDeleteTask(subtaskId).then(() => {});
      return false;
    }),
  }));
}

/**
 * Reducer from an old state with old task to a new state with one task edited.
 *
 * @param {State} state the old state.
 * @param {EditTaskAction} action the reduce action to edit a task.
 * @return {State} the new state.
 */
function editTask(state: State, action: EditTaskAction): State {
  const t = action.task;
  const newTask = {
    ...t,
    subtaskArray: t.subtaskArray.map((subTask: SubTask) => ({
      ...subTask,
      complete: t.complete || subTask.complete,
    })),
  };
  const mainTaskArray = replaceTask(state.mainTaskArray, newTask.id, (task: Task) => {
    httpEditTask(task, newTask).then(st => dispatchAction(backendPatchExistingTaskAction(st)));
    return newTask;
  });
  return { ...state, mainTaskArray };
}

/**
 * Undo the operation of delete task.
 *
 * @param {State} state the old state.
 * @return {State} the new state after the undo.
 */
function undoDeleteTask(state: State): State {
  const { mainTaskArray, undoCache } = state;
  const { lastDeletedTask } = undoCache;
  if (lastDeletedTask === null) {
    return state;
  }
  httpAddTask(lastDeletedTask).then(
    task => dispatchAction(backendPatchNewTaskAction(lastDeletedTask.id, task)),
  );
  return {
    ...state,
    mainTaskArray: [...mainTaskArray, lastDeletedTask],
    undoCache: { ...undoCache, lastDeletedTask: null },
  };
}

export default function rootReducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'ADD_TAG':
      httpNewTag(action.tag).then(t => dispatchAction(backendPatchNewTag(action.tag.id, t)));
      return { ...state, tags: [...state.tags, action.tag] };
    case 'EDIT_TAG':
      httpEditTag(action.tag).then(() => {});
      return {
        ...state,
        tags: state.tags.map((oldTag: Tag) => (
          oldTag.id === action.tag.id ? action.tag : oldTag
        )),
      };
    case 'REMOVE_TAG':
      httpDeleteTag(action.tagId).then(() => {});
      return {
        ...state, tags: state.tags.filter((oldTag: Tag) => (oldTag.id !== action.tagId)),
      };
    case 'ADD_NEW_TASK':
      return { ...state, mainTaskArray: addTask(state.mainTaskArray, action.task) };
    case 'ADD_NEW_SUBTASK':
      return { ...state, mainTaskArray: addSubTask(state.mainTaskArray, action) };
    case 'EDIT_TASK':
      return editTask(state, action);
    case 'EDIT_MAIN_TASK':
      return { ...state, mainTaskArray: editMainTask(state.mainTaskArray, action) };
    case 'EDIT_SUB_TASK':
      return { ...state, mainTaskArray: editSubTask(state.mainTaskArray, action) };
    case 'REMOVE_TASK':
      return removeTaskReducer(state, action);
    case 'REMOVE_SUBTASK':
      return { ...state, mainTaskArray: removeSubtask(state.mainTaskArray, action) };
    case 'UNDO_DELETE_TASK':
      return undoDeleteTask(state);
    case 'CLEAR_UNDO_DELETE_TASK':
      return {
        ...state, undoCache: { ...state.undoCache, lastDeletedTask: null },
      };
    case 'BACKEND_PATCH_NEW_TASK':
      return {
        ...state,
        mainTaskArray: replaceTask(state.mainTaskArray, action.tempNewTaskId, action.task),
      };
    case 'BACKEND_PATCH_NEW_SUBTASK':
      return {
        ...state,
        mainTaskArray: replaceSubTaskWithinMainTask(
          state.mainTaskArray, action.taskId, action.tempNewSubTaskId,
          () => action.subTask,
        ),
      };
    case 'BACKEND_PATCH_EXISTING_TASK':
      return {
        ...state,
        mainTaskArray: replaceTask(state.mainTaskArray, action.task.id, action.task),
      };
    case 'BACKEND_PATCH_LOADED_DATA':
      return { ...state, tags: [defaultNoneTag, ...action.tags], mainTaskArray: action.tasks };
    default:
      return state;
  }
}
