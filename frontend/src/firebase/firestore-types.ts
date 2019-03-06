export type FirestoreCommon = {
  readonly owner: string;
  readonly order: number;
};

export type FirestoreTag = FirestoreCommon & {
  readonly name: string;
  readonly color: string;
  readonly classId: string | null;
};

export type FirestoreTask = FirestoreCommon & {
  readonly name: string;
  readonly tag: string;
  readonly date: Date | { readonly toDate: () => Date };
  readonly complete: boolean;
  readonly inFocus: boolean;
  readonly children: string[];
};

export type FirestoreSubTask = FirestoreCommon & {
  readonly name: string;
  readonly complete: boolean;
  readonly inFocus: boolean;
};
