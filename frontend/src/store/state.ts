import { Map, Set } from 'immutable';
import { State } from 'common/lib/types/store-types';
import { NONE_TAG_ID, NONE_TAG } from 'common/lib/util/tag-util';

/**
 * The initial state of the app.
 * This state is dummy. It needs to be patched by the data from the backend ASAP.
 * @type {State}
 */
export const initialState: State = {
  tags: Map({ [NONE_TAG_ID]: NONE_TAG }),
  tasks: Map(),
  missingSubTasks: Map(),
  orphanSubTasks: Map(),
  dateTaskMap: Map(),
  repeatedTaskSet: Set(),
  settings: { canvasCalendar: null, completedOnboarding: true, theme: 'light' },
  bannerMessageStatus: {},
  courses: Map(),
};

/**
 * The initial state setup for testing.
 * It contains some random values so that snapshot tests can be more meaningful.
 * @type {State}
 */
export const initialStateForTesting: State = {
  tags: Map({
    [NONE_TAG_ID]: NONE_TAG,
    foo: { id: 'foo', order: 1, name: 'Foo', color: 'red', classId: null },
    bar: { id: 'bar', order: 2, name: 'Bar', color: 'blue', classId: null },
    baz: { id: 'baz', order: 3, name: 'Baz: Baz', color: 'green', classId: '2112' },
  }),
  tasks: Map({
    foo: {
      type: 'ONE_TIME',
      id: 'foo',
      order: 1,
      futureViewOrder: 1,
      name: 'Foo',
      tag: 'foo',
      date: new Date('2030-01-01'),
      complete: true,
      inFocus: false,
      children: [{ id: 'foo', order: 1, name: 'Foo', complete: true, inFocus: false }],
    },
    bar: {
      type: 'ONE_TIME',
      id: 'bar',
      order: 2,
      futureViewOrder: 2,
      name: 'Bar',
      tag: 'bar',
      date: new Date('2031-01-01'),
      complete: false,
      inFocus: true,
      children: [{ id: 'bar', order: 2, name: 'Bar', complete: false, inFocus: true }],
    },
    baz: {
      type: 'ONE_TIME',
      id: 'baz',
      order: 3,
      futureViewOrder: 3,
      name: 'Baz',
      tag: 'baz',
      date: new Date('2032-01-01'),
      complete: true,
      inFocus: true,
      children: [{ id: 'baz', order: 3, name: 'Baz', complete: true, inFocus: true }],
    },
  }),
  dateTaskMap: Map({
    [new Date('2030-01-01').toDateString()]: Set(['foo']),
    [new Date('2031-01-01').toDateString()]: Set(['bar', 'baz']),
    [new Date('2032-01-01').toDateString()]: Set(),
  }),
  missingSubTasks: Map(),
  orphanSubTasks: Map(),
  repeatedTaskSet: Set(),
  settings: { canvasCalendar: null, completedOnboarding: true, theme: 'light' },
  bannerMessageStatus: {},
  courses: Map({
    CS2112: [
      {
        courseId: 42,
        subject: 'CS',
        courseNumber: '2112',
        title: 'OO Design Data Structs Honors',
        examTimes: [
          { type: 'final', time: 1576332000000 },
          { type: 'prelim', time: 1570145400000 },
        ],
      },
    ],
  }),
};
