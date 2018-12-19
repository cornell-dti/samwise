// @flow strict

import {
  floatingViewWidth,
  fourDaysViewHeaderHeight,
  otherViewsHeightHeader,
  taskHeight,
} from './future-view-css-props';
import { countTasks } from './future-view-util';
import type { ColoredTask } from './future-view-types';

type PositionRect = {|
  +width: number;
  +height: number;
  +top: number;
  +left: number;
|};
type Props = {|
  +tasks: ColoredTask[];
  +inFourDaysView: boolean;
  +doesShowCompletedTasks: boolean;
  +mainViewPosition: PositionRect;
|};

type PositionStyle = {|
  +width: string;
  +height: string;
  +top: string;
  +left: string;
|};

/**
 * Returns the computed floating view style from some properties.
 *
 * @param {Props} props the props used for computation.
 * @return {PositionStyle} the computed style.
 */
export default function computeFloatingViewStyle(props: Props): PositionStyle {
  const {
    tasks, inFourDaysView, doesShowCompletedTasks,
    mainViewPosition: {
      width, height, top, left,
    },
  } = props;
  // Compute the height of inner content
  const headerHeight = inFourDaysView ? fourDaysViewHeaderHeight : otherViewsHeightHeader;
  const tasksHeight = taskHeight * countTasks(tasks, inFourDaysView, doesShowCompletedTasks);
  const totalHeight = headerHeight + tasksHeight;
  // Decide the maximum allowed height and the actual height
  const maxAllowedHeight = inFourDaysView ? 400 : 300;
  const floatingViewHeight = Math.min(totalHeight, maxAllowedHeight);
  // Compute ideal offset
  let topOffset = (height - floatingViewHeight) / 2;
  let leftOffset = (width - floatingViewWidth) / 2;
  // Correct the offsets if they overflow.
  {
    if (!document.body) {
      throw new Error('Waaaat? No body?!');
    }
    const { offsetWidth, offsetHeight } = document.body;
    const topAbsolutePosition = top + topOffset;
    if (topAbsolutePosition < 0) {
      topOffset -= topAbsolutePosition;
    } else {
      const bottomAbsolutePosition = topAbsolutePosition + floatingViewHeight;
      const diff = bottomAbsolutePosition - offsetHeight;
      if (diff > 0) {
        topOffset -= diff;
      }
    }
    const leftAbsolutePosition = left + leftOffset;
    if (leftAbsolutePosition < 0) {
      leftOffset -= leftAbsolutePosition;
    } else {
      const rightAbsolutePosition = leftAbsolutePosition + floatingViewWidth;
      const diff = rightAbsolutePosition - offsetWidth;
      if (diff > 0) {
        leftOffset -= diff;
      }
    }
  }
  return {
    width: `${floatingViewWidth}px`,
    height: `${floatingViewHeight}px`,
    top: `${topOffset}px`,
    left: `${leftOffset}px`,
  };
}
