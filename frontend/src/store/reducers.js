// @flow strict

import type {
  Action,
  RemoveTagAction,
  EditMainTaskAction,
  EditSubTaskAction,
  EditTaskAction,
  RemoveTaskAction,
  AddNewSubTaskAction,
  RemoveSubTaskAction,
  AddNewTaskAction,
  BackendPatchNewTaskAction,
  BackendPatchBatchNewTasksAction,
  BackendPatchNewSubTaskAction,
  BackendPatchNewTagAction,
  BackendPatchLoadedDataAction,
} from './action-types';
import type {
  Course,
  State, SubTask, Tag, Task,
} from './store-types';
import { emitUndoAddTaskToast, emitUndoRemoveTaskToast } from '../util/toast-util';
import {
  httpAddTask,
  httpDeleteTag,
  httpDeleteTask,
  httpEditBackendTask,
  httpAddSubTask,
  httpEditTag,
  httpEditTask,
  httpNewTag,
  httpBatchAddTasks,
} from '../http/http-service';
import { dispatchAction } from './store';
import {
  backendPatchNewTag as backendPatchNewTagAction,
  backendPatchExistingTask as backendPatchExistingTaskAction,
  backendPatchNewTask as backendPatchNewTaskAction,
  backendPatchBatchNewTasks as backendPatchBatchNewTasksAction,
  backendPatchNewSubTask as backendPatchNewSubTaskAction,
} from './actions';
import { replaceTask, replaceSubTaskWithinMainTask } from '../util/task-util';
import { NONE_TAG, NONE_TAG_ID } from '../util/tag-util';
import { ignore, randomId } from '../util/general-util';

/**
 * The initial state of the app.
 * This state is dummy. It needs to be patched by the data from the backend ASAP.
 * @type {State}
 */
const initialState: State = {
  tasks: [],
  tags: [],
  courses: new Map(),
  undoCache: { lastAddedTaskId: null, lastDeletedTask: null },
};

/**
 * Remove a tag.
 *
 * @see RemoveTagAction
 */
function removeTag(state: State, { tagId }: RemoveTagAction): State {
  httpDeleteTag(tagId);
  const tags = state.tags.filter((oldTag: Tag) => (oldTag.id !== tagId));
  const tasks = state.tasks.map(
    (task: Task) => (task.tag === tagId ? { ...task, tag: NONE_TAG_ID } : task),
  );
  return { ...state, tags, tasks };
}

/**
 * Add a new task.
 *
 * @see AddNewTaskAction
 */
function addTask(state: State, { task }: AddNewTaskAction): State {
  emitUndoAddTaskToast(task);
  httpAddTask(task).then(t => dispatchAction(backendPatchNewTaskAction(task.id, t)));
  return {
    ...state,
    tasks: [...state.tasks, task],
    undoCache: { ...state.undoCache, lastAddedTaskId: task.id },
  };
}

/**
 * Add a new subtask.
 *
 * @see AddNewSubTaskAction
 */
function addSubTask(tasks: Task[], { taskId, subTask }: AddNewSubTaskAction): Task[] {
  return replaceTask(tasks, taskId, (task: Task) => {
    httpAddSubTask(task, subTask).then(serverSubTaskId => dispatchAction(
      backendPatchNewSubTaskAction(taskId, subTask.id, serverSubTaskId),
    ));
    return { ...task, subtasks: [...task.subtasks, subTask] };
  });
}

/**
 * Edit the main task.
 *
 * @see EditMainTaskAction
 */
function editMainTask(
  tasks: Task[], { taskId, partialMainTask }: EditMainTaskAction,
): Task[] {
  return replaceTask(tasks, taskId, (task: Task) => {
    httpEditBackendTask(taskId, partialMainTask).then(() => {});
    return { ...task, ...partialMainTask };
  });
}

/**
 * Edit the subtask.
 *
 * @see EditSubTaskAction
 */
function editSubTask(
  tasks: Task[], { taskId, subtaskId, partialSubTask }: EditSubTaskAction,
): Task[] {
  return replaceSubTaskWithinMainTask(tasks, taskId, subtaskId, (subTask: SubTask) => {
    httpEditBackendTask(subtaskId, partialSubTask).then(() => {});
    return { ...subTask, ...partialSubTask };
  });
}

/**
 * Remove a main task.
 *
 * @see RemoveTaskAction
 */
function removeTask(state: State, { taskId }: RemoveTaskAction): State {
  let lastDeletedTask: Task | null = null;
  httpDeleteTask(taskId).then(ignore);
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
 * @see RemoveSubTaskAction
 */
function removeSubtask(tasks: Task[], { taskId, subtaskId }: RemoveSubTaskAction): Task[] {
  return replaceTask(tasks, taskId, (task: Task) => ({
    ...task,
    subtasks: task.subtasks.filter((subTask: SubTask) => {
      if (subTask.id !== subtaskId) {
        return true;
      }
      httpDeleteTask(subtaskId).then(ignore);
      return false;
    }),
  }));
}

/**
 * Reducer from an old state with old task to a new state with one task edited.
 *
 * @see EditTaskAction
 */
function editTask(state: State, { task, diff }: EditTaskAction): State {
  const tasks = replaceTask(state.tasks, task.id, (oldTask: Task) => {
    httpEditTask(oldTask, diff).then(t => dispatchAction(backendPatchExistingTaskAction(t)));
    return task;
  });
  return { ...state, tasks };
}

/**
 * Import all the course exams.
 */
function importCourseExams(state: State): State {
  const { tags, tasks, courses } = state;
  const newTasks = [];
  tags.forEach((tag) => {
    if (tag.classId === null) {
      return;
    }
    const allCoursesWithId = courses.get(tag.classId);
    if (allCoursesWithId == null) {
      return; // not an error because it may be courses in previous semesters.
    }
    allCoursesWithId.forEach((course: Course) => {
      course.examTimes.forEach((examTime) => {
        const t = new Date(examTime);
        const filter = (task: Task) => {
          const { name, date } = task;
          return task.tag === tag.id && name === 'Exam'
            && date.getFullYear() === t.getFullYear()
            && date.getMonth() === t.getMonth()
            && date.getDate() === t.getDate()
            && date.getHours() === t.getHours();
        };
        if (!tasks.some(filter)) {
          const newTask: Task = {
            id: randomId(),
            name: 'Exam',
            tag: tag.id,
            date: t,
            complete: false,
            inFocus: false,
            subtasks: [],
          };
          newTasks.push(newTask);
        }
      });
    });
  });
  httpBatchAddTasks(newTasks).then((backendNewTasks) => {
    const tempIds = newTasks.map(t => t.id);
    // eslint-disable-next-line no-alert
    alert('Exams Added!');
    dispatchAction(backendPatchBatchNewTasksAction(tempIds, backendNewTasks));
  });
  return { ...state, tasks: [...tasks, ...newTasks] };
}

/**
 * Undo the operation of add task.
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
  httpDeleteTask(lastAddedTaskId).then(ignore);
  return newState;
}

/**
 * Undo the operation of delete task.
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
 * Patch a new tag with backend info.
 *
 * @see BackendPatchNewTagAction
 */
function backendPatchNewTag(state: State, { tempId, backendId }: BackendPatchNewTagAction): State {
  return {
    ...state,
    tags: state.tags.map(t => (t.id === tempId ? ({ ...t, id: backendId }) : t)),
  };
}

/**
 * Patch a new task with backend info.
 *
 * @see BackendPatchNewTaskAction
 */
function backendPatchNewTask(
  state: State,
  { tempId, backendTask }: BackendPatchNewTaskAction,
): State {
  const { tasks, undoCache } = state;
  const newTasks = replaceTask(tasks, tempId, () => backendTask);
  if (undoCache.lastAddedTaskId !== tempId) {
    return { ...state, tasks: newTasks };
  }
  return {
    ...state,
    tasks: newTasks,
    undoCache: { ...undoCache, lastAddedTaskId: backendTask.id },
  };
}

/**
 * Patch batch new task addition with backend info.
 *
 * @see BackendPatchBatchNewTasksAction
 */
function backendBatchPatchNewTasks(
  state: State,
  { tempIds, backendTasks }: BackendPatchBatchNewTasksAction,
): State {
  const { tasks } = state;
  const map = new Map();
  for (let i = 0; i < tempIds.length; i += 1) {
    map.set(tempIds[i], backendTasks[i]);
  }
  const newTasks = [...tasks];
  for (let i = 0; i < newTasks.length; i += 1) {
    const t = newTasks[i];
    const replacement = map.get(t.id);
    if (replacement != null) {
      newTasks[i] = replacement;
    }
  }
  return { ...state, tasks: newTasks };
}

/**
 * Patch a new subtask with backend info.
 *
 * @see BackendPatchNewSubTaskAction
 */
function backendPatchNewSubTask(
  state: State, { taskId, tempSubTaskId, backendSubTaskId }: BackendPatchNewSubTaskAction,
): State {
  return {
    ...state,
    tasks: replaceSubTaskWithinMainTask(
      state.tasks, taskId, tempSubTaskId, s => ({ ...s, id: backendSubTaskId }),
    ),
  };
}

/**
 * Patch the entire redux store with the loaded data from the backend.
 *
 * @see BackendPatchLoadedDataAction
 */
function backendPatchLoadedData(
  state: State, { tags, tasks, courses }: BackendPatchLoadedDataAction,
): State {
  return {
    ...state, tags: [NONE_TAG, ...tags], tasks, courses,
  };
}

export default function rootReducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'ADD_TAG':
      if (action.tag.classId != null && state.tags.some(x => x.classId === action.tag.classId)) {
        return state;
      }
      httpNewTag(action.tag)
        .then(id => dispatchAction(backendPatchNewTagAction(action.tag.id, id)));
      return { ...state, tags: [...state.tags, action.tag] };
    case 'EDIT_TAG':
      httpEditTag(action.tag);
      return {
        ...state,
        tags: state.tags.map((oldTag: Tag) => (
          oldTag.id === action.tag.id ? action.tag : oldTag
        )),
      };
    case 'REMOVE_TAG':
      return removeTag(state, action);
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
    case 'IMPORT_COURSE_EXAMS':
      return importCourseExams(state);
    case 'UNDO_ADD_TASK':
      return undoAddTask(state);
    case 'CLEAR_UNDO_ADD_TASK':
      return { ...state, undoCache: { ...state.undoCache, lastAddedTaskId: null } };
    case 'UNDO_DELETE_TASK':
      return undoDeleteTask(state);
    case 'CLEAR_UNDO_DELETE_TASK':
      return { ...state, undoCache: { ...state.undoCache, lastDeletedTask: null } };
    case 'BACKEND_PATCH_NEW_TAG':
      return backendPatchNewTag(state, action);
    case 'BACKEND_PATCH_NEW_TASK':
      return backendPatchNewTask(state, action);
    case 'BACKEND_PATCH_BATCH_NEW_TASKS':
      return backendBatchPatchNewTasks(state, action);
    case 'BACKEND_PATCH_NEW_SUBTASK':
      return backendPatchNewSubTask(state, action);
    case 'BACKEND_PATCH_EXISTING_TASK':
      return { ...state, tasks: replaceTask(state.tasks, action.task.id, () => action.task) };
    case 'BACKEND_PATCH_LOADED_DATA':
      return backendPatchLoadedData(state, action);
    default:
      return state;
  }
}
