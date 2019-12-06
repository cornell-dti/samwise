import { Map } from 'immutable';
import { Tag } from 'store/store-types';
import { store } from '../../../store/store';
import colorMap from './ListColors';

const allAvailableColors = Object.keys(colorMap);

export function getUnusedColorForTesting(tags: Map<string, Tag>): string {
  const usedColorSet = new Set(Array.from(tags.values()).map((t) => t.color));
  const color = allAvailableColors.find((c) => !usedColorSet.has(c));
  return color ?? allAvailableColors[0];
}

export default function getUnusedColor(): string {
  const { tags } = store.getState();
  return getUnusedColorForTesting(tags);
}
