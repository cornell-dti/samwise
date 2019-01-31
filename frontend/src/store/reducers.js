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
import { DUMMY_TAGS, NONE_TAG, NONE_TAG_ID } from '../util/tag-util';
import { ignore, randomId } from '../util/general-util';

/**
 * Returns the initial state given an app user.
 *
 * @param {AppUser} appUser the user of the app.
 * @return {State} the initial state of the application.
 */
const initialState: State = {
  tasks: [],
  tags: [NONE_TAG, ...DUMMY_TAGS],
  courses: new Map(),
  undoCache: { lastAddedTaskId: null, lastDeletedTask: null },
};

/**
 * Remove a tag.
 *
 * @param {State} state the old state.
 * @param {number} tagId id of the tag to remove.
 * @return {State} the new state.
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
 * @param {State} state the old state.
 * @param {Task} task the new task.
 * @return {Task[]} the new state.
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
 * @param {Task[]} tasks the task array to modify.
 * @param {number} taskId the main task id.
 * @param {SubTask} subTask the subtask to add.
 * @return {Task[]} the new task array.
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
 * @param {Task[]} tasks the task array to modify.
 * @param {number} taskId the main task id.
 * @param {PartialMainTask} partialMainTask partial information of main task to edit.
 * @return {Task[]} the new task array with the specified task edited.
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
 * @param {Task[]} tasks the main task array to modify.
 * @param {number} taskId the main task id.
 * @param {number} subtaskId the subtask id.
 * @param {PartialSubTask} partialMainTask partial information of main task to edit.
 * @return {Task[]} the new task array with the specified task edited.
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
 * @param {State} state the previous state.
 * @param {number} taskId the removed task id.
 * @return {[Task[], Task | null]} the new task array with the specified task remove.
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
      httpDeleteTask(subtaskId).then(ignore);
      return false;
    }),
  }));
}

/**
 * Reducer from an old state with old task to a new state with one task edited.
 *
 * @param {State} state the old state.
 * @param {Task} task the edited task.
 * @param {TaskDiff} diff diff between the old task and this task.
 * @param {EditTaskAction} action the reduce action to edit a task.
 * @return {State} the new state.
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
 *
 * @param {State} state the old state.
 * @return {State} the new state.
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
    dispatchAction(backendPatchBatchNewTasksAction(tempIds, backendNewTasks));
  });
  return { ...state, tasks: [...tasks, ...newTasks] };
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
  httpDeleteTask(lastAddedTaskId).then(ignore);
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
 * Patch a new tag with backend info.
 *
 * @param {State} state the old state.
 * @param {number} tempId the temp randomly assigned new tag id.
 * @param {number} backendId the tag id from backend.
 * @return {State} the new state.
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
 * @param {State} state the old state.
 * @param {number} tempId the temp randomly assigned new task id.
 * @param {number} serverId the task from backend.
 * @return {State} the new state.
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
 * @param {State} state the old state.
 * @param {number[]} tempIds temp ids.
 * @param {Task[]} backendTasks backend tasks.
 * @return {State} the new state.
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
 * @param {State} state the old state.
 * @param {number} taskId the main task id.
 * @param {number} tempSubTaskId the temp randomly assigned new subtask id.
 * @param {number} backendSubTaskId the subtask id from backend.
 * @return {State} the new state.
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

export default function rootReducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case 'ADD_TAG':
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
      return {
        ...state, tags: [NONE_TAG, ...action.tags], tasks: action.tasks, courses: action.courses,
      };
    default:
      return state;
  }
}
