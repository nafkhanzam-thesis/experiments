import cassandra from "cassandra-driver";
import {env} from "./env.js";

const client = new cassandra.Client({
  contactPoints: [env.SCYLLA_DB_HOST],
  localDataCenter: "datacenter1",
  keyspace: "thesis",
});

export type Data = {
  data_source: string;
  split: string;
  idx: number;
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

const keys: readonly (keyof Data)[] = [
  "data_source",
  "split",
  "idx",
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

function createUpdateQuery(data: Data): {
  updateTemplate: string;
  values: cassandra.ArrayOrObject;
} {
  const entries = keys
    .map((key) => [key, data[key]] as const)
    .filter((v) => v[1] !== undefined);
  const setTemplate = entries.map(([key]) => `${key}=?`).join(" AND ");
  const values = entries.map((e) => e[1]);
  const updateTemplate = `UPDATE data SET ${setTemplate}`;
  return {updateTemplate, values};
}

export async function update(data: Data): Promise<void> {
  const {updateTemplate, values} = createUpdateQuery(data);
  await client.execute(updateTemplate, values);
}

export async function batchUpdate(dataList: Data[]): Promise<void> {
  const queries = dataList
    .map((v) => createUpdateQuery(v))
    .map(({updateTemplate, values}) => ({
      query: updateTemplate,
      params: values,
    }));
  await client.batch(queries, {prepare: true});
}

(async (): Promise<void> => {
  const result = await client.execute(`SELECT * FROM data`);
  console.log(result);
  await client.shutdown();
})();
