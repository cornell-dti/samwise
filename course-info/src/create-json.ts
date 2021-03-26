import getAllCoursesInSemester from './fetch-courses';
import { createPrelimJson, createFinalJson } from './fetch-exam';
import mergeCoursesAndExamJson from './merge-json';
import { FullInfo } from './types';

const SEMESTER = 'SP21';

export default async function createCourseJson(): Promise<readonly FullInfo[]> {
  const [courses, prelimExams, finalExams] = await Promise.all([
    getAllCoursesInSemester(SEMESTER),
    createPrelimJson(),
    createFinalJson(),
  ]);
  return mergeCoursesAndExamJson(courses, prelimExams, finalExams);
}
