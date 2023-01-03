import {BatchValue, Client} from "./base.js";
import {dataSources, splits} from "./data.js";

export type DatasetKey = {
  data_source: typeof dataSources[number];
  split: typeof splits[number];
  idx: number;
};

export type Dataset = {
  source_type?: string | undefined;
  amr?: string | undefined;
  amr_dfs?: string | undefined;
  en?: string | undefined;
  id?: string | undefined;
  labse_distance?: number | undefined;
  back_bleu?: number | undefined;
};

export type DatasetBatchValue = BatchValue<DatasetKey, Dataset>;

export const datasetColumns: readonly [keyof Dataset, ...(keyof Dataset)[]] = [
  "source_type",
  "amr",
  "amr_dfs",
  "en",
  "id",
  "labse_distance",
  "back_bleu",
] as const;

export class DatasetClient extends Client<DatasetKey, Dataset> {}

export const datasetDb = new DatasetClient(`dataset`);
