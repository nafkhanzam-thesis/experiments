import {Hook} from "@oclif/core";
import cassandra from "cassandra-driver";
import {env} from "./env.js";

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
  amr?: string;
  amr_dfs?: string;
  en?: string;
  id?: string;
  en__labse?: number[];
  id__labse?: number[];
  id__en__nn_rank?: number;
  en_back?: string;
  en__en_back__bleu?: number;
  en_alt?: string;
  id_alt?: string;
  en_alt__labse?: number[];
  id_alt__labse?: number[];
  id_alt__en_alt__nn_rank?: number;
  en_alt_back?: string;
  en_alt__en_alt_back__bleu?: number;
  en__en_alt__bleu?: number;
};

//! I don't know why it needs to be like this for `zod` to be happy.
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

export class Client {
  static MAX_CHUNK = 1 << 15;
  private static _client?: cassandra.Client;
  static get instance(): cassandra.Client {
    if (!this._client) {
      this._client = new cassandra.Client({
        contactPoints: [env.SCYLLA_DB_HOST],
        localDataCenter: "datacenter1",
        keyspace: env.SCYLLA_DB_KEYSPACE,
        credentials: {
          username: env.SCYLLA_DB_USER,
          password: env.SCYLLA_DB_PASSWORD,
        },
      });
    }
    return this._client;
  }

  static async destroy(): Promise<void> {
    await this._client?.shutdown();
  }
}

function createUpdateQuery(
  dataKey: DataKey,
  data: Data,
): {
  updateTemplate: string;
  values: cassandra.ArrayOrObject;
} {
  const dataEntries = Object.entries(data);
  const setTemplate = dataEntries.map(([key]) => `${key}=?`).join(",");

  const dataKeyEntries = Object.entries(dataKey);
  const whereTemplate = dataKeyEntries.map(([key]) => `${key}=?`).join(" AND ");

  const values = [
    ...dataEntries.map(([_, v]) => v),
    ...dataKeyEntries.map(([_, v]) => v),
  ];
  const updateTemplate = `UPDATE ${env.SCYLLA_DB_TABLE} SET ${setTemplate} WHERE ${whereTemplate}`;
  return {updateTemplate, values};
}

export async function update(dataKey: DataKey, data: Data): Promise<void> {
  const {updateTemplate, values} = createUpdateQuery(dataKey, data);
  await Client.instance.execute(updateTemplate, values);
}

export async function batchUpdate(
  dataList: {dataKey: DataKey; data: Data}[],
): Promise<void> {
  const queries = dataList
    .map(({dataKey, data}) => createUpdateQuery(dataKey, data))
    .map(({updateTemplate, values}) => ({
      query: updateTemplate,
      params: values,
    }));
  await Client.instance.batch(queries, {prepare: true});
}

const hook: Hook<"postrun"> = async function () {
  await Client.destroy();
};

export default hook;
