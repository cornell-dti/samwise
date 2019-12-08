import { Map } from 'immutable';
import { Course } from '../types/store-types';
/**
 * Build a map from course id to courses.
 *
 * @param {Course[]} courses an array of courses.
 * @return {Map<number, Course[]>} the map from course id to courses.
 */
export default function buildCoursesMap(courses: Course[]): Map<string, Course[]>;
