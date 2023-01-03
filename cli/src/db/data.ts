import {BatchValue, Client} from "./base.js";

export const dataSources = [
  "LDC2017",
  "LDC2020",
  "PANL-BPPT",
  "IWSLT17",
] as const;

export const splits = ["train", "dev", "test"] as const;

export type DataKey = {
  data_source: typeof dataSources[number];
  split: typeof splits[number];
  idx: number;
};

export type Data = {
  amr?: string | undefined;
  amr_dfs?: string | undefined;
  en?: string | undefined;
  id?: string | undefined;
  en__labse?: number[] | undefined;
  id__labse?: number[] | undefined;
  id__en__nn_rank?: number | undefined;
  en_back?: string | undefined;
  en__en_back__bleu?: number | undefined;
  en_alt?: string | undefined;
  id_alt?: string | undefined;
  en_alt__labse?: number[] | undefined;
  id_alt__labse?: number[] | undefined;
  id_alt__en_alt__nn_rank?: number | undefined;
  en_alt_back?: string | undefined;
  en_alt__en_alt_back__bleu?: number | undefined;
  en__en_alt__bleu?: number | undefined;
};

export type DataBatchValue = BatchValue<DataKey, Data>;

export const dataColumns: readonly [keyof Data, ...(keyof Data)[]] = [
  "amr",
  "amr_dfs",
  "en",
  "id",
  "en__labse",
  "id__labse",
  "id__en__nn_rank",
  "en_back",
  "en__en_back__bleu",
  "en_alt",
  "id_alt",
  "en_alt__labse",
  "id_alt__labse",
  "id_alt__en_alt__nn_rank",
  "en_alt_back",
  "en_alt__en_alt_back__bleu",
  "en__en_alt__bleu",
] as const;

export class DataClient extends Client<DataKey, Data> {}

export const dataDb = new DataClient(`data`);
