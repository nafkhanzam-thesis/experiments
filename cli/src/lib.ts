import dirTree from "directory-tree";
export {dirTree};

export {default as globby} from "globby";

import * as zod from "zod";
export {zod};

import fs from "fs-extra";
export {fs};

import * as cliProgress from "cli-progress";
export {cliProgress};

import * as cliProgressBar from "@open-tech-world/cli-progress-bar";
import type IRunOptions from "@open-tech-world/cli-progress-bar/lib/IRunOptions";
export {cliProgressBar};

export {execa, execaSync, execaCommand, execaCommandSync} from "execa";

import path from "node:path";
export {path};

export * as streamPromises from "stream/promises";
export {default as sizeof} from "object-sizeof";

import url from "node:url";

export function* tqdm<T>(array: T[]): Generator<T> {
  const progress = new cliProgress.SingleBar(
    {linewrap: false, autopadding: true, forceRedraw: true},
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
  array: [string, PromiseLike<T>][],
): Promise<void> {
  const progress = new cliProgress.MultiBar(
    {linewrap: false, autopadding: true, forceRedraw: true},
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

export function* tqdm2<T>(
  array: T[],
  opts?: {prefix?: (v: T) => string; suffix?: (v: T) => string},
): Generator<T> {
  const progress = new cliProgressBar.ProgressBar({});

  const total = array.length;
  let value = 0;
  progress.run({value, total});

  for (const v of array) {
    const o: IRunOptions = {value: value++, total};
    if (opts?.prefix) {
      o.prefix = opts.prefix(v);
    }
    if (opts?.suffix) {
      o.suffix = opts.suffix(v);
    }
    progress.run(o);
    yield v;
  }

  progress.run({value, total});
  progress.stop();
}

export function* tqdm2Chunk<T>(
  array: Iterable<T[]>,
  total: number,
): Generator<T[]> {
  const progress = new cliProgressBar.ProgressBar({});

  let value = 0;
  progress.run({value, total});

  for (const v of array) {
    progress.run({value, total});
    yield v;
    value += v.length;
  }

  progress.run({value, total});
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

export function readFile(filePath: string): string {
  return String(fs.readFileSync(filePath));
}

export function readCleanedLines(filePath: string): string[] {
  return String(fs.readFileSync(filePath))
    .split("\n")
    .map((v) => v.trim())
    .filter((v) => v);
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

export async function splitFileInto(a: {
  inputFile: string;
  tempFolder: string;
  batch: number;
}): Promise<string[]> {
  const tmpFileList: string[] = [];

  const lines = String(fs.readFileSync(a.inputFile)).split("\n");
  let stream: fs.WriteStream | null = null;
  let currBatch = 0;
  for (let i = 0; i < lines.length; ++i) {
    const line = lines[i];
    const lastIndex = Math.floor((lines.length / a.batch) * (currBatch + 1));
    if (i > lastIndex) {
      ++currBatch;
      if (stream) {
        stream.end();
        await new Promise((resolve, reject) => {
          if (!stream) {
            return reject(new Error(`stream is null.`));
          }
          stream.on("finish", resolve);
          stream.on("close", reject);
        });
        stream = null;
      }
    }
    if (!stream) {
      const tmpFile = path.join(a.tempFolder, a.inputFile, String(currBatch));
      tmpFileList.push(tmpFile);
      if (fs.existsSync(tmpFile)) {
        i = lastIndex;
        ++currBatch;
        continue;
      }
      fs.ensureFileSync(tmpFile);
      stream = fs.createWriteStream(tmpFile);
    }
    if (line.length > 0) {
      stream.write(line);
      stream.write("\n");
    }
  }

  return tmpFileList;
}

export function* splitChunk<T>(array: T[], chunkSize: number): Generator<T[]> {
  let i = 0;
  while (i < array.length) {
    yield array.slice(i, (i += chunkSize));
  }
}
