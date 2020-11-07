// Visible for testing.
// eslint-disable-next-line import/prefer-default-export
export function partition<T>(idList: readonly T[], partitionSize: number): readonly T[][] {
  const partitioned: T[][] = [];
  let collector: T[] = [];
  idList.forEach((id) => {
    if (collector.length === partitionSize) {
      partitioned.push(collector);
      collector = [];
    }
    collector.push(id);
  });
  if (collector.length > 0) {
    partitioned.push(collector);
  }
  return partitioned;
}
