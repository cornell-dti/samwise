import React, { ReactElement } from 'react';
import { Map } from 'immutable';
import { connect } from 'react-redux';
import Fuse from 'fuse.js';
import SearchBox from 'components/Util/SearchBox';
import { Course, State } from 'common/lib/types/store-types';
import styles from './TagAdder.module.css';
import { addTag } from '../../../firebase/actions';
import getUnusedColor from './rotation-color-picker';

type SimpleCourse = {
  readonly key: number;
  readonly value: string;
  readonly subject: string;
  readonly courseNumber: string;
  readonly title: string;
  readonly classId: string;
  readonly noSpaceName: string;
};

type Props = { readonly fuse: Fuse<SimpleCourse> | null };

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
      const { subject, courseNumber, title, courseId: classId } = course;
      const id = `${classId} ${subject} ${courseNumber}`;
      const name = `${subject} ${courseNumber}: ${title}`;
      courseOptions.push({
        key: i,
        value: name,
        subject,
        courseNumber,
        title,
        classId: id,
        noSpaceName: name.replace(/[^a-zA-Z\d]/, ''),
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
const fuseConfigs = {
  keys: [
    'value', // useful for search the full name as we display
    'subject', // useful for finding a list of all [subject] classes
    'courseNumber', // useful if the student just type the course number
    'title', // useful if the student just type the name
    'noSpaceName', // useful if the student types the course code without a space (ex: "CS2112")
  ],
  location: 0, // since we have customized the stuff to search, we can just start at beginning.
  threshold: 0.2, // higher the threshold, more stuff will be matched.
  distance: 100, // how close the match must be to the fuzzy location
};

/**
 * The class tag adder.
 */
function ClassTagAdder({ fuse }: Props): ReactElement | null {
  if (fuse === null) {
    return null;
  }
  const changeClass = (option: SimpleCourse): void => {
    const { value, classId } = option;
    addTag({
      name: value,
      color: getUnusedColor(),
      classId,
    });
  };
  return (
    <div
      className={`${styles.TagColorConfigItemAdder} ${styles.SearchClasses}`}
      title="Search for a class"
    >
      <SearchBox
        placeholder="Search for classes (e.g. CS 2110, Introduction to Creative Writing)"
        inputClassname={styles.SearchInput}
        dropdownItemClassName={styles.DropdownItem}
        fuse={fuse}
        onSelect={changeClass}
      />
    </div>
  );
}

const Memoized = React.memo<Props>(ClassTagAdder);
const Connected = connect(({ courses }: State) => {
  if (courses.size === 0) {
    return { fuse: null };
  }
  const fuse = new Fuse(getCourseOptions(courses), fuseConfigs);
  return { fuse };
})(Memoized);
export default Connected;
