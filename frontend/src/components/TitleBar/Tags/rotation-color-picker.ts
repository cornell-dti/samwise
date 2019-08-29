import { store } from '../../../store/store';
import colorMap from './ListColors';

const allAvailableColors = Object.keys(colorMap);

export default function getUnusedColor(): string {
  const { tags } = store.getState();
  const usedColorSet = new Set(Array.from(tags.values()).map((t) => t.color));
  const color = allAvailableColors.find((c) => !usedColorSet.has(c));
  return color == null ? allAvailableColors[0] : color;
}
