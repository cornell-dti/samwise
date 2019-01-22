// @flow strict

/**
 * Disable the checks related to backend interaction.
 * In production, this must be set to false.
 * It can be set to true in development to speed up coding.
 * @type {boolean}
 */
export const disableBackend = true;

/**
 * The firebase config.
 *
 * @type {Object}
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyBrnR-ai3ZQrr3aYnezDZTZdw9e2TWTRtc',
  authDomain: 'dti-samwise.firebaseapp.com',
  databaseURL: 'https://dti-samwise.firebaseio.com',
  projectId: 'dti-samwise',
  storageBucket: 'dti-samwise.appspot.com',
  messagingSenderId: '114434220691',
};
