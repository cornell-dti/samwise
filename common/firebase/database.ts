/* eslint-disable @typescript-eslint/no-explicit-any */

import { Settings } from '../types/store-types';

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

export interface DocumentReference<T = DocumentData> {
  readonly id: string;
  readonly parent: CollectionReference<T>;
  readonly path: string;
  set(data: T, options?: SetOptions): Promise<any>;
  update(data: Partial<T>): Promise<any>;
  delete(): Promise<any>;
  get(): Promise<DocumentSnapshot<T>>;
  onSnapshot(onNext: (snapshot: DocumentSnapshot<T>) => void): () => void;
}

export interface SnapshotListenOptions {
  readonly includeMetadataChanges?: boolean;
}

export interface SnapshotOptions {
  readonly serverTimestamps?: 'estimate' | 'previous' | 'none';
}

export interface QueryDocumentSnapshot<T = DocumentData> extends DocumentSnapshot {
  data(options?: SnapshotOptions): T;
}

export interface DocumentChange<T = DocumentData> {
  readonly type: 'added' | 'removed' | 'modified';
  readonly doc: QueryDocumentSnapshot<T>;
  readonly oldIndex: number;
  readonly newIndex: number;
}

export interface QuerySnapshot<T = DocumentData> {
  readonly query: Query;
  readonly docs: QueryDocumentSnapshot<T>[];
  readonly size: number;
  readonly empty: boolean;
  docChanges(options?: SnapshotListenOptions): DocumentChange[];
  forEach(callback: (result: QueryDocumentSnapshot<T>) => void, thisArg?: any): void;
}

export interface Query<T = DocumentData> {
  where(fieldPath: string, opStr: WhereFilterOp, value: any): Query<T>;
  orderBy(fieldPath: string, directionStr?: 'desc' | 'asc'): Query<T>;
  limit(limit: number): Query<T>;
  get(): Promise<QuerySnapshot<T>>;
  onSnapshot(onNext: (snapshot: QuerySnapshot<T>) => void): () => void;
}

export interface FirestoreDataConverter<T> {
  toFirestore(modelObject: T): DocumentData;
  toFirestore(modelObject: Partial<T>, options: SetOptions): DocumentData;
  fromFirestore(snapshot: QueryDocumentSnapshot): T;
}

export interface CollectionReference<T = DocumentData> extends Query<T> {
  readonly id: string;
  readonly parent: DocumentReference | null;
  readonly path: string;
  doc(documentPath?: string): DocumentReference<T>;
  add(data: T): Promise<DocumentReference<T>>;
  withConverter<U>(converter: FirestoreDataConverter<U>): CollectionReference<U>;
}

export interface DocumentSnapshot<T = DocumentData> {
  readonly exists: boolean;
  readonly ref: DocumentReference<T>;
  readonly id: string;
  data(): T | undefined;
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

const firestoreSettingsDataConverter: FirestoreDataConverter<Settings> = {
  toFirestore(modelObject: Partial<Settings>) {
    return modelObject;
  },

  fromFirestore(snapshot) {
    const { canvasCalendar, completedOnboarding, theme } = snapshot.data() as Record<
      string,
      unknown
    >;
    if (
      typeof canvasCalendar !== 'undefined' &&
      canvasCalendar !== null &&
      typeof canvasCalendar !== 'string'
    ) {
      throw new Error();
    }
    if (typeof completedOnboarding !== 'boolean') throw new Error();
    if (theme !== 'light' && theme !== 'dark') throw new Error();
    return { canvasCalendar, completedOnboarding, theme };
  },
};

export default class Database {
  // eslint-disable-next-line no-useless-constructor
  constructor(public readonly db: () => CommonFirestore) {}

  orderManagerCollection = (): Collection => this.db().collection('samwise-order-manager');

  settingsCollection = (): CollectionReference<Settings> =>
    this.db().collection('samwise-settings').withConverter(firestoreSettingsDataConverter);

  bannerMessageStatusCollection = (): Collection => this.db().collection('samwise-banner-message');

  tagsCollection = (): Collection => this.db().collection('samwise-tags');

  tasksCollection = (): Collection => this.db().collection('samwise-tasks');

  groupsCollection = (): Collection => this.db().collection('samwise-groups');

  usersCollection = (): Collection => this.db().collection('samwise-users');

  pendingInvitesCollection = (): Collection =>
    this.db().collection('samwise-group-pending-invites');
}
