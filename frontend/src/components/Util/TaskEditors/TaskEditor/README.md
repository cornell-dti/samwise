# TaskEditor Documentation

## Overview

The `TaskEditor` components provide a robust task editor implementation for other parts of the
application that needs a task editor. It supports these features:

- real-time task edits
- keyboard switching

Instead of implementing the task editor for each different needs, you should try to wrap this
component to support additional needs.

This folder contains various components that collectively build the `TaskEditor`. All the components
except the `TaskEditor` component in [`index.tsx`](./index.tsx) are not considered as part of the
public API of this folder. They exist to help manage the complexity of this component.

## [`TaskEditor`](./index.tsx)

### Usage

You can refer to the comments on the `Props` type to figure out what you need to pass in.

### Implementation Strategy

#### Introduction

The `TaskEditor` component defines some callback functions to be called when various actions are
performed, including:

- task is deleted.
- main task is edited.
- one sub-task is created.
- one sub-task is edited.
- one sub-task is deleted.

Most of the times, the callback function simply performs some data transformation and then call
those Firestore action functions to update the state. However, there are some exceptions.

#### Deleting Task

We want to delete the entire task, but the props only pass in a (potentially) filtered task object.

Therefore, we need parent component to pass in the `removeTask` function so that deleting task can
be properly delegated and this task editor does not need to know the unfiltered version of the task.

#### Caching the Newly Created SubTask

If we send the add subtask request to Firestore when the user types the first character, the small
latency will make the UI to flash and the editing experience will be very unnatural.

Therefore, the caching solution is introduced so that the newly created subtask will be cached and
won't be pushed to Firestore.

The push will only happen when the newly created subtask editor loses focus, which means that the
user has finished editing this subtask (for now). Then the adding subtask request will be sent. The
cache will only be invalidated when Firestore pushes back a task object with a subtask that has the
same id as the cached subtask.

#### Focus Management

When user presses enter or tab, the focus should jump to another input box according to user's
intuition. However, React does not support focus management out-of-the-box, so we need to implement
our own.

Internally, the component uses a state slot to remember which input box to focus, and the state will
be reset to `null` after focusing is done. The actual job of imperatively setting the focus is
delegated to sub-components.

## [`EditorHeader`](./EditorHeader.tsx) Implementation Strategy

This component is a simple controlled component. Nothing too fancy.

## [`MainTaskEditor`](./MainTaskEditor.tsx) Implementation Strategy

This is also a simple controlled component. However, it will cache the input of the main task input
box until it loses focus. In this way, it can avoid sending many unnecessary editing event to the
Firestore. The cache will be invalidated when it receives a refresh new task name.

## [`OneSubTaskEditor`](./OneSubTaskEditor.tsx) Implementation Strategy

Similar to `MainTaskEditor`, it also caches the input box value until it loses focus.

In addition, when the `needToBeFocused` prop is `true`, it will use the `useEffect` hook to
imperatively set the focus and then call `afterFocusedCallback` to notify `TaskEditor` that the
setting focus is done.

## [`NewSubTaskEditor`](./NewSubTaskEditor.tsx) Implementation Strategy

Similar to `OneSubTaskEditor`, it also uses `needToBeFocused` and `afterFocusedCallback` props to
do the focus management. In addition, it will call `onChange` when the user types a character.
