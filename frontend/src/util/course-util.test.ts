import { Course } from 'store/store-types';
import buildCoursesMap from './courses-util';

it('buildCoursesMap works', () => {
  const course1: Course = {
    courseId: 1,
    subject: 'CS',
    courseNumber: '2112',
    title: 'TODO',
    examTimes: [{ type: 'prelim', time: 0 }],
  };
  const course2: Course = {
    courseId: 2,
    subject: 'CS',
    courseNumber: '4120',
    title: 'TODO',
    examTimes: [{ type: 'final', time: 0 }, { type: 'prelim', time: 0 }],
  };
  const course3: Course = {
    courseId: 1,
    subject: 'CS',
    courseNumber: '2112',
    title: 'TODO',
    examTimes: [{ type: 'final', time: 0 }],
  };
  const coursesArray: Course[] = [course1, course2, course3];
  const builtMap = buildCoursesMap(coursesArray);
  expect(builtMap.get('1 CS 2112')).toEqual([course1, course3]);
  expect(builtMap.get('2 CS 4120')).toEqual([course2]);
});
