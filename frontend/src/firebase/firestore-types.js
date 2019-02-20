// @flow strict

export type FirestoreCommon = {|
  +owner: string;
  +order: number;
|};

export type FirestoreTag = {|
  ...FirestoreCommon;
  +name: string;
  +color: string;
  +classId: number | null;
|};

export type FirestoreTask = {|
  ...FirestoreCommon;
  +type: 'TASK';
  +name: string;
  +tag: string;
  +date: Date | { +toDate: () => Date };
  +complete: boolean;
  +inFocus: boolean;
|};

export type FirestoreSubTask = {|
  ...FirestoreCommon;
  +type: 'SUBTASK';
  +parent: string;
  +name: string;
  +complete: boolean;
  +inFocus: boolean;
|};
