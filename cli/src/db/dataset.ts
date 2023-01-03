import {BatchValue, Client} from "./base.js";
import {splits} from "./data.js";

export type DatasetKey = {
  split: typeof splits[number];
  idx: number;
};

export type Dataset = {
  data_source?: string | undefined;
  source_type?: string | undefined;
  amr?: string | undefined;
  amr_dfs?: string | undefined;
  en?: string | undefined;
  id?: string | undefined;
};

export type DatasetBatchValue = BatchValue<DatasetKey, Dataset>;

export const datasetColumns: readonly [keyof Dataset, ...(keyof Dataset)[]] = [
  "data_source",
  "source_type",
  "amr",
  "amr_dfs",
  "en",
  "id",
] as const;

export class DatasetClient extends Client<DatasetKey, Dataset> {}

export const datasetDb = new DatasetClient(`dataset`);
