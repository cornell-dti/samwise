import React, { useState, ReactElement } from 'react';
import { Map } from 'immutable';
// @ts-ignore we need to rewrite the entire component!
import ReactSearchBox from 'react-search-box';
import { connect } from 'react-redux';
import styles from './TagAdder.module.css';
import { Course, State } from '../../../store/store-types';
import { addTag } from '../../../firebase/actions';
import getUnusedColor from './rotation-color-picker';

type Props = { readonly courses: Map<string, Course[]> };

type SimpleCourse = {
  readonly key: number;
  readonly value: string;
  readonly subject: string;
  readonly courseNumber: string;
  readonly title: string;
  readonly classId: string;
};

/**
 * Returns the computed course options.
 *
 * @param {Map<number, Course[]>} courseMap new courses.
 * @return {SimpleCourse[]} course options.
 */
function getCourseOptions(courseMap: Map<string, Course[]>): SimpleCourse[] {
  const courseOptions: SimpleCourse[] = [];
  let i = 0;
  courseMap.forEach((courses: Course[]) => {
    courses.forEach((course: Course) => {
      const {
        subject, courseNumber, title, courseId: classId,
      } = course;
      const id = `${classId} ${subject} ${courseNumber}`;
      const name = `${subject} ${courseNumber}: ${title}`;
      courseOptions.push({
        key: i, value: name, subject, courseNumber, title, classId: id,
      });
      i += 1;
    });
  });
  return courseOptions;
}

/**
 * The configs for fuse searcher. Essential for fuzzy search.
 * You may need to tune this further, but it's usable right now.
 */
const fuseConfigs: { keys: string[]; location: number; threshold: number } = {
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
 */
function ClassTagAdder({ courses }: Props): ReactElement | null {
  const [key, setKey] = useState(0);
  if (courses.size === 0) {
    return null;
  }
  const changeClass = (option: SimpleCourse): void => {
    const { value, classId } = option;
    addTag({
      name: value, color: getUnusedColor(), classId,
    });
    // force the react search box to rerender due to its bug.
    setKey(prev => prev + 1);
  };
  return (
    <div className={`${styles.TagColorConfigItemAdder} ${styles.SearchClasses}`} title="Search for a class">
      <ReactSearchBox
        tabIndex={0}
        data={getCourseOptions(courses)}
        value=""
        fuseConfigs={fuseConfigs}
        onSelect={changeClass}
        placeholder="Search for classes (e.g. CS 2110, Introduction to Creative Writing)"
        key={key}
      />
    </div>
  );
}

const Memoized = React.memo<Props>(ClassTagAdder);
const Connected = connect(({ courses }: State) => ({ courses }))(Memoized);
export default Connected;
