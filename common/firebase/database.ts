/* eslint-disable @typescript-eslint/no-explicit-any */

type DocumentData = { [field: string]: any };
type UpdateData = { [fieldPath: string]: any };
type WhereFilterOp =
  | '<'
  | '<='
  | '=='
  | '>='
  | '>'
  | 'array-contains'
  | 'in'
  | 'array-contains-any';

export interface SetOptions {
  readonly merge?: boolean;
}

export interface DocumentReference {
  readonly id: string;
  readonly parent: CollectionReference;
  readonly path: string;
  set(data: DocumentData, options?: SetOptions): Promise<any>;
  update(data: UpdateData): Promise<any>;
  delete(): Promise<any>;
  get(): Promise<DocumentSnapshot>;
  onSnapshot(onNext: (snapshot: DocumentSnapshot) => void): () => void;
}

export interface SnapshotListenOptions {
  readonly includeMetadataChanges?: boolean;
}

export interface SnapshotOptions {
  readonly serverTimestamps?: 'estimate' | 'previous' | 'none';
}

export interface QueryDocumentSnapshot extends DocumentSnapshot {
  data(options?: SnapshotOptions): DocumentData;
}

export interface DocumentChange {
  readonly type: 'added' | 'removed' | 'modified';
  readonly doc: QueryDocumentSnapshot;
  readonly oldIndex: number;
  readonly newIndex: number;
}

export interface QuerySnapshot {
  readonly query: Query;
  readonly docs: QueryDocumentSnapshot[];
  readonly size: number;
  readonly empty: boolean;
  docChanges(options?: SnapshotListenOptions): DocumentChange[];
  forEach(callback: (result: QueryDocumentSnapshot) => void, thisArg?: any): void;
}

export interface Query {
  where(fieldPath: string, opStr: WhereFilterOp, value: any): Query;
  orderBy(fieldPath: string, directionStr?: 'desc' | 'asc'): Query;
  limit(limit: number): Query;
  startAt(snapshot: DocumentSnapshot): Query;
  startAt(...fieldValues: any[]): Query;
  startAfter(snapshot: DocumentSnapshot): Query;
  startAfter(...fieldValues: any[]): Query;
  endBefore(snapshot: DocumentSnapshot): Query;
  endBefore(...fieldValues: any[]): Query;
  endAt(snapshot: DocumentSnapshot): Query;
  endAt(...fieldValues: any[]): Query;
  get(): Promise<QuerySnapshot>;
  onSnapshot(onNext: (snapshot: QuerySnapshot) => void): () => void;
}

export interface CollectionReference extends Query {
  readonly id: string;
  readonly parent: DocumentReference | null;
  readonly path: string;
  doc(documentPath?: string): DocumentReference;
  add(data: DocumentData): Promise<DocumentReference>;
}

export interface DocumentSnapshot {
  readonly exists: boolean;
  readonly ref: DocumentReference;
  readonly id: string;
  data(): DocumentData | undefined;
}

export interface Transaction {
  get(documentRef: DocumentReference): Promise<DocumentSnapshot>;

  set(documentRef: DocumentReference, data: DocumentData, options?: SetOptions): Transaction;

  update(documentRef: DocumentReference, data: UpdateData): Transaction;

  delete(documentRef: DocumentReference): Transaction;
}

export interface WriteBatch {
  set(documentRef: DocumentReference, data: DocumentData, options?: SetOptions): WriteBatch;
  update(documentRef: DocumentReference, data: UpdateData): WriteBatch;
  delete(documentRef: DocumentReference): WriteBatch;
  commit(): Promise<any>;
}

export interface CommonFirestore {
  collection(name: string): CollectionReference;
  runTransaction<T>(update: (transaction: Transaction) => Promise<T>): Promise<T>;
  batch(): WriteBatch;
}

type Collection = CollectionReference;

export default class Database {
  // eslint-disable-next-line no-useless-constructor
  constructor(public readonly db: () => CommonFirestore) {}

  orderManagerCollection = (): Collection => this.db().collection('samwise-order-manager');

  settingsCollection = (): Collection => this.db().collection('samwise-settings');

  bannerMessageStatusCollection = (): Collection => this.db().collection('samwise-banner-message');

  tagsCollection = (): Collection => this.db().collection('samwise-tags');

  tasksCollection = (): Collection => this.db().collection('samwise-tasks');

  subTasksCollection = (): Collection => this.db().collection('samwise-subtasks');

  groupsCollection = (): Collection => this.db().collection('samwise-groups');

  usersCollection = (): Collection => this.db().collection('samwise-users');

  pendingInvitesCollection = (): Collection =>
    this.db().collection('samwise-group-pending-invites');
}
