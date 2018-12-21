// @flow strict

import type {
  Action,
  EditMainTaskAction,
  EditSubTaskAction,
  EditTaskAction,
  RemoveTaskAction,
  AddNewSubTaskAction,
  RemoveSubTaskAction,
  BackendPatchNewTaskAction, AddNewTaskAction,
} from './action-types';
import type {
  State, SubTask, Tag, Task,
} from './store-types';
import { emitUndoAddTaskToast, emitUndoRemoveTaskToast } from '../util/toast-util';
import {
  httpAddTask,
  httpDeleteTag,
  httpDeleteTask,
  httpEditMainTask,
  httpNewSubTask,
  httpEditSubTask,
  httpEditTag,
  httpEditTask,
  httpNewTag,
} from '../http/http-service';
import { dispatchAction } from './store';
import {
  backendPatchExistingTask as backendPatchExistingTaskAction, backendPatchNewSubTask,
  backendPatchNewTag,
  backendPatchNewTask as backendPatchNewTaskAction,
} from './actions';
import { replaceTask, replaceSubTaskWithinMainTask } from '../util/task-util';
import { NONE_TAG } from '../util/tag-util';

/**
 * Returns the initial state given an app user.
 *
 * @param {AppUser} appUser the user of the app.
 * @return {State} the initial state of the application.
 */
const initialState: State = {
  tasks: [],
  tags: [
    NONE_TAG,
    {
      id: 0, type: 'other', name: 'Personal', color: '#9D4AA9',
    },
    {
      id: 1, type: 'other', name: 'Project Team', color: '#FF8A8A',
    },
    {
      id: 2, type: 'class', name: 'CS1110', color: '#B92424',
    },
  ],
  undoCache: { lastAddedTaskId: null, lastDeletedTask: null },
};

/**
 * Add a new task.
 *
 * @param {State} state the old state.
 * @param {Task} task the new task.
 * @return {Task[]} the new state.
 */
function addTask(state: State, { task }: AddNewTaskAction): State {
  emitUndoAddTaskToast(task);
  httpAddTask(task).then(id => dispatchAction(backendPatchNewTaskAction(task.id, id)));
  return {
    ...state,
    tasks: [...state.tasks, task],
    undoCache: { ...state.undoCache, lastAddedTaskId: task.id },
  };
}

/**
 * Add a new subtask.
 *
 * @param {Task[]} tasks the task array to modify.
 * @param {number} taskId the main task id.
 * @param {SubTask} subTask the subtask to add.
 * @return {Task[]} the new task array.
 */
function addSubTask(tasks: Task[], { taskId, subTask }: AddNewSubTaskAction): Task[] {
  return replaceTask(tasks, taskId, (task: Task) => {
    httpNewSubTask(task, subTask).then(backendSubTask => dispatchAction(
      backendPatchNewSubTask(taskId, subTask.id, backendSubTask.id),
    ));
    return { ...task, subtasks: [...task.subtasks, subTask] };
  });
}

/**
 * Edit the main task.
 *
 * @param {Task[]} tasks the task array to modify.
 * @param {number} taskId the main task id.
 * @param {PartialMainTask} partialMainTask partial information of main task to edit.
 * @return {Task[]} the new task array with the specified task edited.
 */
function editMainTask(
  tasks: Task[], { taskId, partialMainTask }: EditMainTaskAction,
): Task[] {
  return replaceTask(tasks, taskId, (task: Task) => {
    const newTask = { ...task, ...partialMainTask };
    const { id, subtasks, ...mainTask } = newTask;
    httpEditMainTask(taskId, mainTask).then(() => {});
    return newTask;
  });
}

/**
 * Edit the subtask.
 *
 * @param {Task[]} tasks the main task array to modify.
 * @param {number} taskId the main task id.
 * @param {number} subtaskId the subtask id.
 * @param {PartialSubTask} partialMainTask partial information of main task to edit.
 * @return {Task[]} the new task array with the specified task edited.
 */
function editSubTask(
  tasks: Task[], { taskId, subtaskId, partialSubTask }: EditSubTaskAction,
): Task[] {
  return replaceSubTaskWithinMainTask(tasks, taskId, subtaskId, (subTask, mainTask) => {
    const newSubTask = { ...subTask, ...partialSubTask };
    httpEditSubTask(mainTask, subTask).then(() => {});
    return newSubTask;
  });
}

/**
 * Remove a main task.
 *
 * @param {State} state the previous state.
 * @param {number} taskId the removed task id.
 * @return {[Task[], Task | null]} the new task array with the specified task remove.
 */
function removeTask(state: State, { taskId }: RemoveTaskAction): State {
  let lastDeletedTask: Task | null = null;
  httpDeleteTask(taskId).then(() => {});
  const tasks = state.tasks.filter((task: Task) => {
    if (task.id !== taskId) {
      return true;
    }
    lastDeletedTask = task;
    return false;
  });
  const undoCache = { ...state.undoCache, lastDeletedTask };
  if (lastDeletedTask != null) {
    emitUndoRemoveTaskToast(lastDeletedTask);
  }
  return { ...state, tasks, undoCache };
}

/**
 * Remove a subtask.
 *
 * @param {Task[]} tasks the task array to modify.
 * @param {number} taskId id of the parent task of the subtask.
 * @param {number} subtaskId the id of the subtask.
 * @return {Task[]} the new task array with the specified subtask removed.
 */
function removeSubtask(tasks: Task[], { taskId, subtaskId }: RemoveSubTaskAction): Task[] {
  return replaceTask(tasks, taskId, (task: Task) => ({
    ...task,
    subtasks: task.subtasks.filter((subTask: SubTask) => {
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
    subtasks: t.subtasks.map((subTask: SubTask) => ({
      ...subTask,
      complete: t.complete || subTask.complete,
    })),
  };
  const tasks = replaceTask(state.tasks, newTask.id, (task: Task) => {
    httpEditTask(task, newTask).then(st => dispatchAction(backendPatchExistingTaskAction(st)));
    return newTask;
  });
  return { ...state, tasks };
}

/**
 * Undo the operation of add task.
 *
 * @param {State} state the old state.
 * @return {State} the new state after the undo.
 */
function undoAddTask(state: State): State {
  const { tasks, undoCache } = state;
  const { lastAddedTaskId } = undoCache;
  if (lastAddedTaskId === null) {
    return state;
  }
  const newState = {
    ...state,
    tasks: tasks.filter(t => t.id !== lastAddedTaskId),
    undoCache: { ...undoCache, lastAddedTaskId: null },
  };
  if (lastAddedTaskId < -50) {
    return newState;
  }
  httpDeleteTask(lastAddedTaskId).then(() => {});
  return newState;
}

/**
 * Undo the operation of delete task.
 *
 * @param {State} state the old state.
 * @return {State} the new state after the undo.
 */
function undoDeleteTask(state: State): State {
  const { tasks, undoCache } = state;
  const { lastDeletedTask } = undoCache;
  if (lastDeletedTask === null) {
    return state;
  }
  httpAddTask(lastDeletedTask).then(
    id => dispatchAction(backendPatchNewTaskAction(lastDeletedTask.id, id)),
  );
  return {
    ...state,
    tasks: [...tasks, lastDeletedTask],
    undoCache: { ...undoCache, lastDeletedTask: null },
  };
}

/**
 * Patch a new task with backend info.
 *
 * @param {State} state the old state.
 * @param {BackendPatchNewTaskAction} action the patch action.
 * @return {State} the new state.
 */
function backendPatchNewTask(state: State, action: BackendPatchNewTaskAction): State {
  const { tasks, undoCache } = state;
  const newTasks = replaceTask(tasks, action.tempId, t => ({ ...t, id: action.serverId }));
  if (undoCache.lastAddedTaskId !== action.tempId) {
    return { ...state, tasks: newTasks };
  }
  return {
    ...state,
    tasks: newTasks,
    undoCache: { ...undoCache, lastAddedTaskId: action.serverId },
  };
}

export default function rootReducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'ADD_TAG':
      httpNewTag(action.tag).then(id => dispatchAction(backendPatchNewTag(action.tag.id, id)));
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
      return addTask(state, action);
    case 'ADD_NEW_SUBTASK':
      return { ...state, tasks: addSubTask(state.tasks, action) };
    case 'EDIT_TASK':
      return editTask(state, action);
    case 'EDIT_MAIN_TASK':
      return { ...state, tasks: editMainTask(state.tasks, action) };
    case 'EDIT_SUB_TASK':
      return { ...state, tasks: editSubTask(state.tasks, action) };
    case 'REMOVE_TASK':
      return removeTask(state, action);
    case 'REMOVE_SUBTASK':
      return { ...state, tasks: removeSubtask(state.tasks, action) };
    case 'UNDO_ADD_TASK':
      return undoAddTask(state);
    case 'CLEAR_UNDO_ADD_TASK':
      return { ...state, undoCache: { ...state.undoCache, lastAddedTaskId: null } };
    case 'UNDO_DELETE_TASK':
      return undoDeleteTask(state);
    case 'CLEAR_UNDO_DELETE_TASK':
      return { ...state, undoCache: { ...state.undoCache, lastDeletedTask: null } };
    case 'BACKEND_PATCH_NEW_TAG':
      return {
        ...state,
        tags: state.tags
          .map(t => (t.id === action.tempId ? ({ ...t, id: action.serverId }) : t)),
      };
    case 'BACKEND_PATCH_NEW_TASK':
      return backendPatchNewTask(state, action);
    case 'BACKEND_PATCH_NEW_SUBTASK':
      return {
        ...state,
        tasks: replaceSubTaskWithinMainTask(
          state.tasks, action.taskId, action.tempSubTaskId, s => ({
            ...s, id: action.serverSubTaskId,
          }),
        ),
      };
    case 'BACKEND_PATCH_EXISTING_TASK':
      return { ...state, tasks: replaceTask(state.tasks, action.task.id, action.task) };
    case 'BACKEND_PATCH_LOADED_DATA':
      return { ...state, tags: [NONE_TAG, ...action.tags], tasks: action.tasks };
    default:
      return state;
  }
}
