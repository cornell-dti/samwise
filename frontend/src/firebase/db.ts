import firebase from 'firebase/app';
import 'firebase/firestore';
import Database from 'common/lib/firebase/database';

export const db = (): firebase.firestore.Firestore => firebase.firestore();

export const database: Database = new Database(db);
