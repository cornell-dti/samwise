// @flow strict

import React from 'react';
import type { ComponentType } from 'react';
import ReactSearchBox from 'react-search-box';
import { connect } from 'react-redux';
import styles from './TagAdder.css';
import type { Course } from '../../../store/store-types';
import { addTag } from '../../../firebase/actions';

type Props = {| +courses: Map<number, Course[]>; |};

type SimpleCourse = {|
  +key: number;
  +value: string;
  +subject: string;
  +courseNumber: string;
  +title: string;
  +classId: number;
|};

/**
 * Returns the computed course options.
 *
 * @param {Map<number, Course[]>} courseMap new courses.
 * @return {SimpleCourse[]} course options.
 */
function getCourseOptions(courseMap: Map<number, Course[]>): SimpleCourse[] {
  const courseOptions = [];
  let i = 0;
  courseMap.forEach((courses: Course[]) => {
    courses.forEach((course: Course) => {
      const {
        subject, courseNumber, title, courseId: classId,
      } = course;
      const name = `${subject} ${courseNumber}: ${title}`;
      courseOptions.push({
        key: i, value: name, subject, courseNumber, title, classId,
      });
      i += 1;
    });
  });
  return courseOptions;
}

/**
 * The configs for fuse searcher. Essential for fuzzy search.
 * You may need to tune this further, but it's usable right now.
 *
 * @type {{keys: string[], threshold: number}}
 */
const fuseConfigs = {
  keys: [
    'value', // useful for search the full name as we display
    'subject', // useful for finding a list of all [subject] classes
    'courseNumber', // useful if the student just type the course number
    'title', // useful if the student just type the name
  ],
  location: 0, // since we have customized the stuff to search, we can just start at beginning.
  threshold: 0.2, // higher the threshold, more stuff will be matched.
};

/**
 * The class tag adder.
 *
 * @param {Map<number, Course[]>} courses all courses.
 * @return {Node} the rendered node.
 * @constructor
 */
function ClassTagAdder({ courses }: Props) {
  if (courses.size === 0) {
    return null;
  }
  const changeClass = (option: SimpleCourse) => {
    const { value, classId } = option;
    addTag({
      name: value, color: '#56d9c1', classId,
    });
  };
  return (
    <div className={`${styles.TagColorConfigItemAdder} ${styles.SearchClasses}`}>
      <ReactSearchBox
        data={getCourseOptions(courses)}
        value=""
        fuseConfigs={fuseConfigs}
        onSelect={changeClass}
        placeholder="Search for classes (e.g. CS 2110, Introduction to Creative Writing)"
      />
    </div>
  );
}

const ConnectedClassTagAdder: ComponentType<{||}> = connect(
  ({ courses }) => ({ courses }), null,
)(React.memo(ClassTagAdder));
export default ConnectedClassTagAdder;
