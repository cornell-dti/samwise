/* eslint-disable @typescript-eslint/no-explicit-any */

import { firestore } from 'firebase';
import {
  FirestoreGroup,
  FirestoreTag,
  FirestoreTask,
  FirestoreUserData,
} from '../types/firestore-types';
import { BannerMessageStatus, Settings, SubTask } from '../types/store-types';
import { FirestoreOrderManager } from './order-manager';

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

const firestoreOrderManagerDataConverter: FirestoreDataConverter<FirestoreOrderManager> = {
  toFirestore(modelObject: Partial<FirestoreOrderManager>) {
    return modelObject;
  },

  fromFirestore(snapshot) {
    const { tagsMaxOrder, tasksMaxOrder } = snapshot.data() as Record<string, unknown>;
    if (typeof tagsMaxOrder !== 'number' || typeof tasksMaxOrder !== 'number') {
      throw new Error();
    }
    return { tagsMaxOrder, tasksMaxOrder };
  },
};

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

const firestoreBannerMessageStatusDataConverter: FirestoreDataConverter<BannerMessageStatus> = {
  toFirestore(modelObject: Partial<BannerMessageStatus>) {
    return modelObject;
  },

  fromFirestore(snapshot) {
    const status = snapshot.data() as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(status).map(([id, read]) => {
        if (typeof read === 'boolean' || typeof read === 'undefined') {
          return [id, read];
        }
        throw new Error();
      })
    );
  },
};

const firestoreTagDataConverter: FirestoreDataConverter<FirestoreTag> = {
  toFirestore(modelObject: Partial<FirestoreTag>) {
    return modelObject;
  },

  fromFirestore(snapshot) {
    const { order, owner, name, color, classId } = snapshot.data() as Record<string, unknown>;
    if (
      typeof order !== 'number' ||
      typeof owner !== 'string' ||
      typeof name !== 'string' ||
      typeof color !== 'string' ||
      (typeof classId !== 'string' && classId !== null)
    ) {
      throw new Error();
    }
    return { order, owner, name, color, classId };
  },
};

const firestoreTaskDataConverter: FirestoreDataConverter<FirestoreTask> = {
  toFirestore(modelObject: Partial<FirestoreTask>) {
    return modelObject;
  },

  fromFirestore(snapshot): FirestoreTask {
    const {
      order,
      owner,
      name,
      tag,
      complete,
      inFocus,
      children,
      type,
      ...rest
    } = snapshot.data() as Record<string, unknown>;
    if (
      typeof order !== 'number' ||
      !Array.isArray(owner) ||
      typeof name !== 'string' ||
      typeof tag !== 'string' ||
      typeof complete !== 'boolean' ||
      typeof inFocus !== 'boolean' ||
      !Array.isArray(children)
    ) {
      throw new Error();
    }
    const ownerStringArray = owner.map((email) => {
      if (typeof email !== 'string') throw new Error();
      return email;
    });
    const childrenArray = children.map(
      (subtaskData): SubTask => {
        if (typeof subtaskData !== 'object') throw new Error();
        const {
          order: subtaskOrder,
          name: subtaskName,
          complete: subtaskComplete,
          inFocus: subtaskInFocus,
        } = subtaskData;
        if (
          typeof subtaskOrder !== 'number' ||
          typeof subtaskName !== 'string' ||
          typeof subtaskComplete !== 'boolean' ||
          typeof subtaskInFocus !== 'boolean'
        ) {
          throw new Error();
        }
        return {
          order: subtaskOrder,
          name: subtaskName,
          complete: subtaskComplete,
          inFocus: subtaskInFocus,
        };
      }
    );
    if (type === 'ONE_TIME') {
      const { date, icalUID } = rest;
      if (
        date instanceof firestore.Timestamp &&
        (icalUID === undefined || typeof icalUID === 'string')
      ) {
        return {
          type,
          order,
          owner: ownerStringArray,
          name,
          tag,
          complete,
          inFocus,
          children: childrenArray,
          date,
          icalUID,
        };
      }
    } else if (type === 'GROUP') {
      const { date, group } = rest;
      if (date instanceof firestore.Timestamp && typeof group === 'string') {
        return {
          type,
          order,
          owner: ownerStringArray,
          name,
          tag,
          complete,
          inFocus,
          children: childrenArray,
          date,
          group,
        };
      }
    } else if (type === 'MASTER_TEMPLATE') {
      const { date, forks } = rest;
      if (typeof date !== 'object' || !Array.isArray(forks)) throw new Error();
      const { startDate, endDate, pattern } = date as Record<string, unknown>;
      if (
        !(startDate instanceof firestore.Timestamp) ||
        (!(endDate instanceof firestore.Timestamp) && typeof endDate !== 'number') ||
        typeof pattern !== 'object'
      ) {
        throw new Error();
      }
      const { type: repeatingPatternType, bitSet } = pattern as Record<string, unknown>;
      if (
        (repeatingPatternType !== 'WEEKLY' &&
          repeatingPatternType !== 'BIWEEKLY' &&
          repeatingPatternType !== 'MONTHLY') ||
        typeof bitSet !== 'number'
      ) {
        throw new Error();
      }
      const forksArray = forks.map(({ forkId, replaceDate }) => {
        if (
          (forkId === null || typeof forkId === 'string') &&
          replaceDate instanceof firestore.Timestamp
        ) {
          return { forkId, replaceDate };
        }
        throw new Error();
      });
      return {
        type,
        order,
        owner: ownerStringArray,
        name,
        tag,
        complete,
        inFocus,
        children: childrenArray,
        date: { startDate, endDate, pattern: { type: repeatingPatternType, bitSet } },
        forks: forksArray,
      };
    }
    throw new Error();
  },
};

const firestoreGroupDataConverter: FirestoreDataConverter<FirestoreGroup> = {
  toFirestore(modelObject: Partial<FirestoreGroup>) {
    return modelObject;
  },

  fromFirestore(snapshot) {
    const {
      name,
      members,
      deadline,
      classCode,
      invitees,
      inviterNames,
    } = snapshot.data() as Record<string, unknown>;
    if (
      typeof name !== 'string' ||
      !Array.isArray(members) ||
      !(deadline instanceof firestore.Timestamp) ||
      typeof classCode !== 'string' ||
      !Array.isArray(invitees) ||
      !Array.isArray(inviterNames)
    ) {
      throw new Error();
    }
    const membersStringArray = members.map((member) => {
      if (typeof member !== 'string') throw new Error();
      return member;
    });
    const inviteesStringArray = invitees.map((invitee) => {
      if (typeof invitee !== 'string') throw new Error();
      return invitee;
    });
    const inviterNamesStringArray = inviterNames.map((inviterName) => {
      if (typeof inviterName !== 'string') throw new Error();
      return inviterName;
    });
    return {
      name,
      members: membersStringArray,
      deadline,
      classCode,
      invitees: inviteesStringArray,
      inviterNames: inviterNamesStringArray,
    };
  },
};

const firestoreUserDataConverter: FirestoreDataConverter<FirestoreUserData> = {
  toFirestore(modelObject: Partial<FirestoreUserData>) {
    return modelObject;
  },

  fromFirestore(snapshot) {
    const { name, photoURL } = snapshot.data() as Record<string, unknown>;
    if (typeof name !== 'string' || typeof photoURL !== 'string') {
      throw new Error();
    }
    return { name, photoURL };
  },
};

export default class Database {
  // eslint-disable-next-line no-useless-constructor
  constructor(public readonly db: () => CommonFirestore) {}

  orderManagerCollection = (): CollectionReference<FirestoreOrderManager> =>
    this.db().collection('samwise-order-manager').withConverter(firestoreOrderManagerDataConverter);

  settingsCollection = (): CollectionReference<Settings> =>
    this.db().collection('samwise-settings').withConverter(firestoreSettingsDataConverter);

  bannerMessageStatusCollection = (): CollectionReference<BannerMessageStatus> =>
    this.db()
      .collection('samwise-banner-message')
      .withConverter(firestoreBannerMessageStatusDataConverter);

  tagsCollection = (): CollectionReference<FirestoreTag> =>
    this.db().collection('samwise-tags').withConverter(firestoreTagDataConverter);

  tasksCollection = (): CollectionReference<FirestoreTask> =>
    this.db().collection('samwise-tasks').withConverter(firestoreTaskDataConverter);

  groupsCollection = (): CollectionReference<FirestoreGroup> =>
    this.db().collection('samwise-groups').withConverter(firestoreGroupDataConverter);

  usersCollection = (): CollectionReference<FirestoreUserData> =>
    this.db().collection('samwise-users').withConverter(firestoreUserDataConverter);
}
