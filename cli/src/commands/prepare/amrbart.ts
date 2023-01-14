import {Command, Flags} from "@oclif/core";
import {splits} from "../../db/data";
import {datasetDb, DatasetKey} from "../../db/dataset";
import {fs, path, tqdm2Async, writeCleanLines, zod} from "../../lib";

export default class PrepareAMRBARTCommand extends Command {
  static override description = "Prepare AMRBART training datasets.";

  static override flags = {
    fetchSize: Flags.integer({
      description: `Fetch size of batch data.`,
      default: 5000,
    }),
    outputDir: Flags.string({
      description: `The output files directory.`,
      default: `data/outputs/amrbart`,
    }),
  };

  public async run(): Promise<void> {
    const {flags} = await this.parse(PrepareAMRBARTCommand);

    fs.ensureDirSync(flags.outputDir);

    const datasetKeys: Omit<DatasetKey, "idx">[] = [
      {data_source: "IWSLT17", split: "train", source_type: "original"},
      {data_source: "PANL-BPPT", split: "train", source_type: "original"},
      {data_source: "LDC2020", split: "train", source_type: "original"},
      {data_source: "LDC2020", split: "train", source_type: "alternative"},
      {data_source: "LDC2020", split: "dev", source_type: "original"},
      {data_source: "LDC2020", split: "dev", source_type: "alternative"},
      {data_source: "LDC2017", split: "test", source_type: "original"},
    ];
    const datasetArrays: Record<
      DatasetKey["split"],
      {sent: string; amr: string}[]
    > = {
      train: [],
      dev: [],
      test: [],
    };
    for (const datasetKey of datasetKeys) {
      const total = await datasetDb.count(datasetKey);
      const fetchGen = tqdm2Async(
        datasetDb.batchSelect(
          datasetKey,
          ["amr_dfs", "en", "id"],
          flags.fetchSize,
        ),
        total,
        {
          suffix: (v) =>
            `${v.dataKey.data_source}-${v.dataKey.split}-${v.dataKey.source_type}-${v.dataKey.idx}`,
        },
      );
      for await (const {dataKey, data} of fetchGen) {
        const amr = zod.string().parse(data.amr_dfs);
        datasetArrays[dataKey.split].push({
          amr,
          sent: zod.string().parse(data.en),
        });
        datasetArrays[dataKey.split].push({
          amr,
          sent: zod.string().parse(data.id),
        });
      }
    }

    this.log(`Writing to csv files...`);

    for (const split of splits) {
      const fileNameMapper: Record<DatasetKey["split"], string> = {
        train: "train.jsonl",
        dev: "val.jsonl",
        test: "test.jsonl",
      };
      writeCleanLines(
        path.join(flags.outputDir, fileNameMapper[split]),
        datasetArrays[split].map((v) => JSON.stringify(v)),
      );
    }

    this.log(`DONE.`);
  }
}
