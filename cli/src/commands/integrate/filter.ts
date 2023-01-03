import {Command, Flags} from "@oclif/core";
import {Data, dataDb, dataSources, splits} from "../../db/data.js";
import {DatasetBatchValue, datasetDb} from "../../db/dataset.js";
import {tqdm2Async, zod} from "../../lib.js";

const totalEstimation = {
  "PANL-BPPT-train": 24024,
  "IWSLT17-train": 107329,
  "LDC2020-train": 55635,
  "LDC2020-dev": 1722,
};

export default class IntegrateFilterCommand extends Command {
  static override description = `Filter data table into dataset table.`;

  static override flags = {
    dataSource: Flags.enum({
      options: [...dataSources],
      required: true,
    }),
    split: Flags.enum({
      options: [...splits],
      required: true,
    }),
    fetchSize: Flags.integer({
      default: 1000,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(IntegrateFilterCommand);

    const fetchGen = dataDb.batchSelect(
      {
        data_source: flags.dataSource,
        split: flags.split,
      },
      [
        "amr",
        "amr_dfs",
        "en",
        "id",
        "en_alt",
        "id_alt",
        "en__en_back__bleu",
        "en_alt__en_alt_back__bleu",
        "labse_distance",
        "alt__labse_distance",
        "id__en__nn_rank",
        "en__en_alt__bleu",
        "id_alt__en_alt__nn_rank",
      ],
      flags.fetchSize,
    );
    const batchValues: DatasetBatchValue[] = [];
    for await (const {dataKey, data} of tqdm2Async(
      fetchGen,
      // @ts-expect-error trust oclif
      totalEstimation[`${flags.dataSource}-${flags.split}`],
      {
        suffix: (v) =>
          `${v.dataKey.data_source}-${v.dataKey.split}-${v.dataKey.idx}`,
      },
    )) {
      if (dataKey.data_source === "LDC2020") {
        if (this.testCriteriaOriginal(data)) {
          batchValues.push({
            dataKey: {
              data_source: dataKey.data_source,
              split: dataKey.split,
              idx: dataKey.idx,
            },
            data: {
              source_type: `original`,
              amr: data.amr,
              amr_dfs: data.amr_dfs,
              en: data.en,
              id: data.id,
              labse_distance: data.labse_distance,
              back_bleu: data.en__en_back__bleu,
            },
          });
        }
        if (this.testCriteriaAlt(data)) {
          batchValues.push({
            dataKey: {
              data_source: dataKey.data_source,
              split: dataKey.split,
              idx: dataKey.idx,
            },
            data: {
              source_type: `alternative`,
              amr: data.amr,
              amr_dfs: data.amr_dfs,
              en: data.en_alt,
              id: data.id_alt,
              labse_distance: data.alt__labse_distance,
              back_bleu: data.en_alt__en_alt_back__bleu,
            },
          });
        }
      } else {
        batchValues.push({
          dataKey: {
            data_source: dataKey.data_source,
            split: dataKey.split,
            idx: dataKey.idx,
          },
          data: {
            source_type: `original`,
            amr: data.amr,
            amr_dfs: data.amr_dfs,
            en: data.en,
            id: data.id,
          },
        });
      }
      if (batchValues.length >= flags.fetchSize) {
        await datasetDb.batchUpdate(batchValues);
        batchValues.length = 0;
      }
    }

    if (batchValues.length > 0) {
      await datasetDb.batchUpdate(batchValues);
    }

    this.log(`DONE.`);
  }

  private testCriteriaOriginal(data: Data): boolean {
    return zod.number().parse(data.id__en__nn_rank) <= 1;
  }

  private testCriteriaAlt(data: Data): boolean {
    const bleu = zod.number().parse(data.en__en_alt__bleu);
    return (
      zod.number().parse(data.id_alt__en_alt__nn_rank) <= 1 &&
      10 < bleu &&
      bleu < 90
    );
  }
}
