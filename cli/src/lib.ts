import dirTree from "directory-tree";
export {dirTree};

export {default as globby} from "globby";

import * as zod from "zod";
export {zod};

import fs from "fs-extra";
export {fs};

import * as cliProgress from "cli-progress";
export {cliProgress};

export {execa, execaSync, execaCommand, execaCommandSync} from "execa";

import path from "node:path";
export {path};

import url from "node:url";

export function* tqdm<T>(array: T[]): Generator<T> {
  const progress = new cliProgress.SingleBar(
    {linewrap: false, autopadding: true},
    cliProgress.Presets.rect,
  );

  progress.start(array.length, 0);

  for (const v of array) {
    yield v;
    progress.increment();
  }

  progress.stop();
}

export async function tqdmPromises<T>(
  array: [string, Promise<T>][],
): Promise<void> {
  const progress = new cliProgress.MultiBar(
    {linewrap: false, autopadding: true},
    {
      ...cliProgress.Presets.rect,
      format: ` {bar}\u25A0 {percentage}% | {label}`,
    },
  );

  for (const [label, p] of array) {
    const bar = progress.create(1, 0, {label});
    p.then(() => bar.increment());
  }

  await Promise.all(array.map(([_, p]) => p));

  progress.stop();
}

export const listFormat = (arr: unknown[]): string => {
  const listStart = arr.slice(0, -1).join(", ");
  const listEnd = arr.slice(-1);
  const conjunction =
    arr.length <= 1 ? "" : arr.length > 2 ? ", and " : " and ";

  return [listStart, listEnd].join(conjunction);
};

export const isValidFile = (filePath: string): boolean => {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isFile();
};

export const isValidDirectory = (filePath: string): boolean => {
  return fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory();
};

export function cartesianProduct<T extends unknown[]>(
  ...allEntries: unknown[][]
): T {
  // @ts-expect-error idc
  return allEntries.reduce(
    (results, entries) =>
      results
        // @ts-expect-error idc
        .map((result) => entries.map((entry) => [...result, entry]))
        .reduce((subResults, result) => [...subResults, ...result], []),
    [[]],
  );
}

export function getCwd(): string {
  return path.dirname(url.fileURLToPath(import.meta.url));
}

export async function validateFileList(
  rawFileList: unknown,
): Promise<
  {success: true; filePaths: string[]} | {success: false; errorMsg: string}
> {
  const filePaths = zod.string().array().parse(rawFileList);
  const notFoundList: string[] = [];
  for (const filePath of filePaths) {
    if (!isValidFile(filePath)) {
      notFoundList.push(filePath);
    }
  }

  if (notFoundList.length > 0) {
    const notFoundListStr = notFoundList.map((v) => `> ${v}`).join("\n");
    return {
      success: false,
      errorMsg: `This file(s) was not found:\n${notFoundListStr}`,
    };
  }

  return {success: true, filePaths};
}
