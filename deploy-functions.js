/**
 * A script to deploy functions to Firebase.
 *
 * Exists because Firebase's CLI cannot fetch code outside the functions
 * folder.
 *
 * Run with `node deploy-functions.js`
 *
 * Optionally pass in a token and then project, like so:
 * `node deploy-functions.js $TOKEN production`
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('This script buffers output until the end of a command before printing. If it looks like it hangs for a few minutes at a time, be patient.');

// Step 1: Build projects

console.log(spawnSync('yarn', [], { shell: true }).stdout.toString());
console.log(spawnSync('yarn', ['workspace', 'functions', 'build'], { shell: true }).stdout.toString());

// Step 2: Make mirror folders for deployment

/**
 * Directory copy
 * @param {string} from The path to the thing to copy.
 * @param {string} to The path to the new copy.
 */
function copyFolderSync(from, to) {
  fs.mkdirSync(to);
  fs.readdirSync(from).forEach((element) => {
    if (fs.lstatSync(path.join(from, element)).isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}
fs.mkdirSync('temp');

// Copy deployment code
copyFolderSync('functions/compiled/', 'temp/functions/');
fs.rmdirSync('functions/compiled/', { recursive: true });
const tmpPackage = `{
  "name": "functions",
  "private": true,
  "version": "0.1.0",
  "main": "index.js",
  "engines": {
    "node": "8"
  }
}`;
fs.writeFileSync('temp/functions/package.json', tmpPackage);

// Copy Firebase configs
fs.copyFileSync('firebase.json', 'temp/firebase.json');
fs.copyFileSync('.firebaserc', 'temp/.firebaserc');

// Step 3: Deploy

const token = process.argv[2] ? process.argv[2] : 'default';
const project = process.argv[3];

/**
 * Run the firebase CLI with specified argument array
 */
function firebase(args) {
  console.log(spawnSync(`${__dirname}/node_modules/.bin/firebase`, args, { cwd: 'temp', shell: true }).stdout.toString());
}

firebase(['use', 'default']);
if (!project) {
  firebase(['deploy', '--only', 'functions']);
} else {
  firebase(['deploy', `--token=${token}`, '--non-interactive', '--only', 'functions']);
}

// Step 4: Cleanup
fs.rmdirSync('temp', { recursive: true });
