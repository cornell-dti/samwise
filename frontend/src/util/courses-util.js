// @flow strict

import { Map } from 'immutable';
import type { Course } from '../store/store-types';

/**
 * Build a map from course id to courses.
 *
 * @param {Course[]} courses an array of courses.
 * @return {Map<number, Course[]>} the map from course id to courses.
 */
export default function buildCoursesMap(courses: Course[]): Map<number, Course[]> {
  const map = Map<number, Course[]>();
  return map.withMutations((m) => {
    for (let i = 0; i < courses.length; i += 1) {
      const course = courses[i];
      const existingCourses = m.get(course.courseId);
      if (existingCourses == null) {
        m.set(course.courseId, [course]);
      } else {
        existingCourses.push(course);
      }
    }
  });
}
