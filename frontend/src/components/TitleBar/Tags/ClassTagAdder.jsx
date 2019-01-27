// @flow strict

import React from 'react';
import ReactSearchBox from 'react-search-box';
import { addTag as addTagAction } from '../../../store/actions';
import type { AddTagAction } from '../../../store/action-types';
import styles from './TagAdder.css';
import type { Course, Tag } from '../../../store/store-types';
import { randomId } from '../../../util/general-util';
import { dispatchConnect } from '../../../store/react-redux-util';
import { getCourses } from '../../../store/store';

type Props = {|
  +addTag: (tag: Tag) => AddTagAction
|};

type SimpleCourse = {| +key: number; +value: string; |};

/**
 * Course options cache.
 * @type {SimpleCourse[]}
 */
let courseOptions: SimpleCourse[] = [];

/**
 * Returns the computed course options.
 *
 * @return {SimpleCourse[]} course options.
 */
function getCourseOptions(): SimpleCourse[] {
  if (courseOptions.length === 0) {
    const courseMap = getCourses();
    courseOptions = [];
    courseMap.forEach((courses: Course[]) => {
      courses.forEach((course: Course) => {
        courseOptions.push({
          key: course.courseId, value: `${course.subject} ${course.courseNumber}: ${course.title}`,
        });
      });
    });
    courseOptions.sort((a, b) => a.value.localeCompare(b.value));
  }
  return courseOptions;
}

function ClassTagAdder(props: Props) {
  const changeClass = (option: SimpleCourse) => {
    const { key, value } = option;
    const { addTag } = props;
    addTag({
      id: randomId(), name: value, color: '#56d9c1', classId: key,
    });
  };
  return (
    <div className={`${styles.TagColorConfigItemAdder} ${styles.SearchClasses}`}>
      <ReactSearchBox
        data={getCourseOptions()}
        value=""
        callback={changeClass}
        placeholder="Search for classes (e.g. CS 2110, Introduction to Creative Writing)"
      />
    </div>
  );
}

const ConnectedClassTagAdder = dispatchConnect<Props, Props>(
  { addTag: addTagAction },
)(ClassTagAdder);
export default ConnectedClassTagAdder;
