/* eslint-disable no-console */

import fetch from 'node-fetch';
import { CourseInfo } from './types';

const PREFIX = 'https://classes.cornell.edu/api/2.0';

const wait = (time: number): Promise<void> =>
  new Promise((resolve) => setTimeout(() => resolve(), time));

async function getSubjects(semester: string): Promise<readonly string[]> {
  try {
    const response = await fetch(`${PREFIX}/config/subjects.json?roster=${semester}`);
    const json = await response.json();
    return json.data.subjects.map((it: { value: string }) => it.value);
  } catch {
    return [];
  }
}

async function getCoursesInSemesterAndSubject(
  semester: string,
  subject: string
): Promise<readonly CourseInfo[]> {
  try {
    const response = await fetch(
      `${PREFIX}/search/classes.json?roster=${semester}&subject=${subject}`
    );
    const json = await response.json();
    return json.data.classes.map(
      ({ crseId: courseId, catalogNbr: courseNumber, titleShort: title }): CourseInfo => ({
        courseId,
        subject,
        courseNumber,
        title,
      })
    );
  } catch {
    return [];
  }
}

export default async function getAllCoursesInSemester(
  semester: string,
  coolingTimeMs = 40
): Promise<readonly CourseInfo[]> {
  const courses: CourseInfo[] = [];
  const subjects = await getSubjects(semester);
  console.log(`We have ${subjects.length} subjects in ${semester} total.`);
  let subjectCount = 0;
  // Intentionally do await in a loop to throttle request speed.
  // eslint-disable-next-line no-restricted-syntax
  for (const subject of subjects) {
    // eslint-disable-next-line no-await-in-loop
    const semesterCourses = await getCoursesInSemesterAndSubject(semester, subject);
    courses.push(...semesterCourses);
    // eslint-disable-next-line no-await-in-loop
    await wait(coolingTimeMs);
    subjectCount += 1;
    console.log(`There're ${semesterCourses.length} courses in ${subject} in ${semester}.`);
    console.log(`We fetched ${subjectCount} out of ${subjects.length} subjects in ${semester}.`);
  }
  return courses;
}
