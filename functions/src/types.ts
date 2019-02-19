interface FirestoreCommon {
  readonly owner: string;
  readonly order: number;
}

interface FirestoreTag extends FirestoreCommon {
  readonly name: string;
  readonly color: string;
  readonly classId: number | null;
}

interface FirestoreTask extends FirestoreCommon {
  readonly type: 'TASK';
  readonly name: string;
  readonly tag: string;
  readonly date: any;
  readonly complete: boolean;
  readonly inFocus: boolean;
}

interface FirestoreSubTask extends FirestoreCommon {
  readonly type: 'SUBTASK';
  readonly parent: string;
  readonly name: string;
  readonly complete: boolean;
  readonly inFocus: boolean;
}
