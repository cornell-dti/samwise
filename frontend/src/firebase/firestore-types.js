// @flow strict

export type FirestoreCommon = {|
  +owner: string;
  +order: number;
|};

export type FirestoreTag = {|
  ...FirestoreCommon;
  +name: string;
  +color: string;
  +classId: string | null;
|};

export type FirestoreTask = {|
  ...FirestoreCommon;
  +name: string;
  +tag: string;
  +date: Date | {| +toDate: () => Date |};
  +complete: boolean;
  +inFocus: boolean;
  +children: string[];
|};

export type FirestoreSubTask = {|
  ...FirestoreCommon;
  +name: string;
  +complete: boolean;
  +inFocus: boolean;
|};
