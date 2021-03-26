/* eslint-disable no-console */

import { spawnSync } from 'child_process';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';

import { Octokit } from '@octokit/rest';
import createCourseJson from './create-json';
import { FullInfo } from './types';

const TEMP_JSON_FILENAME = 'courses-with-exams-min.json';
const FRONTEND_JSON_FILENAME = '../frontend/src/assets/json/courses-with-exams-min.json';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function runCommand(program: string, ...programArguments: readonly string[]) {
  const programArgumentsQuoted = programArguments
    .map((it) => (it.includes(' ') ? `"${it}"` : it))
    .join(' ');
  console.log(`> ${program} ${programArgumentsQuoted}`);
  return spawnSync(program, programArguments, { stdio: 'inherit' });
}

async function main(): Promise<void> {
  const json = await createCourseJson();
  if (!process.env.CI) {
    writeFileSync(TEMP_JSON_FILENAME, JSON.stringify(json));
    return;
  }

  // Get diff
  const oldJson = (JSON.parse(readFileSync(FRONTEND_JSON_FILENAME).toString()) as FullInfo[]).sort(
    (a, b) => a.courseId - b.courseId
  );
  writeFileSync('old.json', `${JSON.stringify(oldJson, undefined, 2)}\n`);
  writeFileSync('new.json', `${JSON.stringify(json, undefined, 2)}\n`);
  const diff = spawnSync('diff', ['--unified=0', 'old.json', 'new.json']).stdout.toString();
  unlinkSync('old.json');
  unlinkSync('new.json');
  writeFileSync(FRONTEND_JSON_FILENAME, JSON.stringify(json));
  if (diff === '') return;

  // Create commit
  runCommand('git', 'config', '--global', 'user.name', 'dti-github-bot');
  runCommand('git', 'config', '--global', 'user.email', 'admin@cornelldti.org');
  const gitBranch = 'dti-github-bot/update-course-json';
  const commitMessage = '[course-info][bot] Automatically update course JSON';
  runCommand('git', 'add', FRONTEND_JSON_FILENAME);
  runCommand('git', 'fetch', '--all');
  runCommand('git', 'checkout', 'master');
  runCommand('git', 'checkout', '-b', gitBranch);
  if (runCommand('git', 'commit', '-m', commitMessage).status === 0) {
    if (runCommand('git', 'push', '-f', 'origin', gitBranch).status !== 0) {
      runCommand('git', 'push', '-f', '--set-upstream', 'origin', gitBranch);
    }
  }

  // Create PR
  const octokit = new Octokit({
    auth: `token ${process.env.BOT_TOKEN}`,
    userAgent: 'cornell-dti/big-diff-warning',
  });
  const diffString = diff.length > 65000 ? `${diff.substring(0, 65000)}\nTruncated...` : diff;
  const prBody = `## Summary
This is a PR auto-generated from \`yarn workspace course-info fetch\`.
The diff of the course-json is displayed below:
\`\`\`diff
${diffString}
\`\`\`
## Test Plan
:eyes:`;
  const existingPR = (
    await octokit.pulls.list({
      owner: 'cornell-dti',
      repo: 'samwise',
      state: 'open',
    })
  ).data.find((pr) => pr.title === commitMessage);
  if (existingPR == null) {
    console.log('No existing PR. Creating new one...');
    await octokit.pulls.create({
      owner: 'cornell-dti',
      repo: 'samwise',
      title: commitMessage,
      body: prBody,
      base: 'master',
      head: gitBranch,
    });
  } else {
    console.log('Found existing PR. Updating PR comments...');
    await octokit.pulls.update({
      owner: 'cornell-dti',
      repo: 'samwise',
      pull_number: existingPR.number,
      body: prBody,
    });
  }
}

main();
