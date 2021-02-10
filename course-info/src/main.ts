import { writeFileSync } from 'fs';

import getAllCoursesInSemester from './fetch-courses';
import { createPrelimJson } from './fetch-exam';
import mergeCoursesAndExamJson from './merge-json';

const SEMESTER = 'SP21';
const JSON_FILENAME = 'courses-with-exams-min.json';

async function main(): Promise<void> {
  const [courses, prelimExams] = await Promise.all([
    getAllCoursesInSemester(SEMESTER),
    createPrelimJson(),
    // createFinalJson(),
  ]);
  const json = mergeCoursesAndExamJson(courses, prelimExams);
  // eslint-disable-next-line no-console
  writeFileSync(JSON_FILENAME, JSON.stringify(json));
}

main();
