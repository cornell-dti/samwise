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

// Step 1: Build projects

spawnSync('yarn', [], { shell: true, stdio: [process.stdin, process.stdout, process.stderr] });
spawnSync('yarn', ['workspace', 'functions', 'build'], { shell: true, stdio: [process.stdin, process.stdout, process.stderr] });

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

/**
 * Delete a folder recursively (because fs.rmdirSync recursive doesn't work on CI)
 *
 * @param {string} p The path to delete
 */
function deleteFolderRecursive(p) {
  if (fs.existsSync(p)) {
    fs.readdirSync(p).forEach((file) => {
      const curPath = path.join(p, file);
      if (fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(p);
  }
}

// Copy deployment code
copyFolderSync('functions/compiled/', 'temp/functions/');
deleteFolderRecursive('functions/compiled/');
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

const token = process.argv[2];
const project = process.argv[3] ? process.argv[3] : 'default';

/**
 * Run the firebase CLI with specified argument array
 *
 * @param {string[]} args Array of arguments to pass to the CLI.
 */
function firebase(args) {
  spawnSync(`${__dirname}/node_modules/.bin/firebase`, args, { cwd: 'temp', shell: true, stdio: [process.stdin, process.stdout, process.stderr] });
}

firebase(['use', project]);
if (!token) {
  firebase(['deploy', '--only', 'functions']);
} else {
  firebase(['deploy', `--token=${token}`, '--non-interactive', '--only', 'functions']);
}

// Step 4: Cleanup
deleteFolderRecursive('temp');
