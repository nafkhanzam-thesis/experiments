import {Command, Flags} from "@oclif/core";
import {Data, dataDb, splits} from "../../db/data.js";
import {DatasetBatchValue, datasetDb} from "../../db/dataset.js";
import {tqdm2Async, zod} from "../../lib.js";

const totalEstimation = {
  train: 55635,
  dev: 1722,
};

export default class IntegrateFilterCommand extends Command {
  static override description = `Filter data table into dataset table.`;

  static override flags = {
    split: Flags.string({
      options: [...splits],
      required: true,
    }),
    fetchSize: Flags.integer({
      default: 1000,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(IntegrateFilterCommand);

    const data_source = `LDC2020`;

    const fetchGen = dataDb.batchSelect(
      {
        data_source,
        // @ts-expect-error trust oclif
        split: flags.split,
      },
      [
        "split",
        "data_source",
        "amr",
        "amr_dfs",
        "en",
        "id",
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
      totalEstimation[flags.split],
      {
        suffix: (v) =>
          `${v.dataKey.data_source}-${v.dataKey.split}-${v.dataKey.idx}`,
      },
    )) {
      if (this.testCriteriaOriginal(data)) {
        batchValues.push({
          dataKey: {
            split: dataKey.split,
            idx: dataKey.idx,
          },
          data: {
            amr: data.amr,
            amr_dfs: data.amr_dfs,
            data_source: dataKey.data_source,
            en: data.en,
            id: data.id,
            source_type: `original`,
          },
        });
      }
      if (this.testCriteriaAlt(data)) {
        batchValues.push({
          dataKey: {
            split: dataKey.split,
            idx: dataKey.idx,
          },
          data: {
            amr: data.amr,
            amr_dfs: data.amr_dfs,
            data_source: dataKey.data_source,
            en: data.en_alt,
            id: data.id_alt,
            source_type: `alternative`,
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
