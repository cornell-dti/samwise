import { Map } from 'immutable';
/**
 * Build a map from course id to courses.
 *
 * @param {Course[]} courses an array of courses.
 * @return {Map<number, Course[]>} the map from course id to courses.
 */
export default function buildCoursesMap(courses) {
    const map = Map();
    return map.withMutations((m) => {
        for (let i = 0; i < courses.length; i += 1) {
            const course = courses[i];
            const id = `${course.courseId} ${course.subject} ${course.courseNumber}`;
            const existingCourses = m.get(id);
            if (existingCourses == null) {
                m.set(id, [course]);
            }
            else {
                existingCourses.push(course);
            }
        }
    });
}
