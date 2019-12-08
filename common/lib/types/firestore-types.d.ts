import { firestore } from 'firebase/app';
import { RepeatingPattern } from './store-types';
export declare type FirestoreCommon = {
    readonly owner: string;
    readonly order: number;
};
export declare type FirestoreTag = FirestoreCommon & {
    readonly name: string;
    readonly color: string;
    readonly classId: string | null;
};
export declare type FirestoreCommonTask = FirestoreCommon & {
    readonly name: string;
    readonly tag: string;
    readonly complete: boolean;
    readonly inFocus: boolean;
    readonly children: readonly string[];
};
export declare type FirestoreSubTask = FirestoreCommon & {
    readonly name: string;
    readonly complete: boolean;
    readonly inFocus: boolean;
};
export declare type ForkedTaskMetaData = {
    readonly forkId: string | null;
    readonly replaceDate: Date | firestore.Timestamp;
};
export declare type FirestoreMasterTask = FirestoreCommonTask & {
    readonly type: 'MASTER_TEMPLATE';
    readonly date: {
        readonly startDate: Date | firestore.Timestamp;
        readonly endDate: number | Date | firestore.Timestamp;
        readonly pattern: RepeatingPattern;
    };
    readonly forks: readonly ForkedTaskMetaData[];
};
export declare type FirestoreOneTimeTask = FirestoreCommonTask & {
    readonly type: 'ONE_TIME';
    readonly date: Date | firestore.Timestamp;
};
export declare type FirestoreTask = FirestoreMasterTask | FirestoreOneTimeTask;
