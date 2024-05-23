export const getUniqueElements = <T>(arr1: T[], arr2: T[]): T[] => {
  const set = new Set(arr2);
  return arr1.filter((item) => !set.has(item));
};

export function* chunks<T>(arr: T[], chunkSize: number): IterableIterator<T[]> {
  for (let i = 0; i < arr.length; i += chunkSize) {
    yield arr.slice(i, i + chunkSize);
  }
}

export function getRanges(begin: number, finish: number, chunkSize: number): [bigint, bigint][] {
  const ranges: [bigint, bigint][] = [];
  for (let start = begin; start <= finish; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, finish);
    ranges.push([BigInt(start), BigInt(end)]);
  }

  return ranges;
}
