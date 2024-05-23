export const getUniqueElements = <T>(arr1: T[], arr2: T[]): T[] => {
  const set = new Set(arr2);
  return arr1.filter((item) => !set.has(item));
};

export const chunks = <T>(input: T[], size: number): T[][] => {
  return input.reduce((arr: T[][], item: T, idx: number) => {
    return idx % size === 0 ? [...arr, [item]] : [...arr.slice(0, -1), [...arr.slice(-1)[0], item]];
  }, [] as T[][]);
};

export function getRanges(begin: number, finish: number, chunkSize: number): [bigint, bigint][] {
  const ranges: [bigint, bigint][] = [];
  for (let start = begin; start <= finish; start += chunkSize) {
    const end = Math.min(start + chunkSize - 1, finish);
    ranges.push([BigInt(start), BigInt(end)]);
  }

  return ranges;
}
