import { writeFileSync } from 'fs';

import getAllCoursesInSemester from './fetch-courses';
import { createFinalJson, createPrelimJson, createSemiFinalJson } from './fetch-exam';
import mergeCoursesAndExamJson from './merge-json';

const SEMESTER = 'FA20';
const JSON_FILENAME = `${SEMESTER.toLocaleLowerCase()}-courses-with-exams-min.json`;

async function main(): Promise<void> {
  const [courses, prelimExams, semifinalExams, finalExams] = await Promise.all([
    getAllCoursesInSemester(SEMESTER),
    createPrelimJson(),
    createSemiFinalJson(),
    createFinalJson(),
  ]);
  const json = mergeCoursesAndExamJson(courses, prelimExams, semifinalExams, finalExams);
  // eslint-disable-next-line no-console
  writeFileSync(JSON_FILENAME, JSON.stringify(json));
}

main();
