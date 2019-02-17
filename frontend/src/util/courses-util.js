// @flow strict

import type { Course } from '../store/store-types';

/**
 * Build a map from course id to courses.
 *
 * @param {Course[]} courses an array of courses.
 * @return {Map<number, Course[]>} the map from course id to courses.
 */
export default function buildCoursesMap(courses: Course[]): Map<number, Course[]> {
  const map = new Map();
  for (let i = 0; i < courses.length; i += 1) {
    const course = courses[i];
    const existingCourses = map.get(course.courseId);
    if (existingCourses == null) {
      map.set(course.courseId, [course]);
    } else {
      existingCourses.push(course);
    }
  }
  return map;
}
