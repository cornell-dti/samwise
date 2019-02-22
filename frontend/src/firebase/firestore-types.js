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
  +name: string;
  +tag: string;
  +date: Date | {| +toDate: () => Date |};
  +complete: boolean;
  +inFocus: boolean;
|};

export type FirestoreSubTask = {|
  ...FirestoreCommon;
  +name: string;
  +complete: boolean;
  +inFocus: boolean;
|};

export type FirebaseTaskChildrenMap = {|
  +owner: string;
  +children: string[];
|};
