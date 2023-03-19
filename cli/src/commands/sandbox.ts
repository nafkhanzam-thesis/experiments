import {Command} from "@oclif/core";
import {datasetDb} from "../db/dataset.js";
import {writeCleanLines} from "../lib.js";

export default class SandboxCommand extends Command {
  async run(): Promise<void> {
    const fetchGen = datasetDb.batchSelect(
      {
        data_source: "LDC2017",
        split: "test",
        source_type: "original",
      },
      ["amr_dfs"],
      1000,
    );

    const lines: string[] = [];
    let befIdx = -1;
    for await (const {dataKey, data} of fetchGen) {
      if (!data.amr_dfs) {
        return this.error(`data.amr_dfs is undefined.`);
      }
      if (dataKey.idx !== befIdx + 1) {
        return this.error(`idx is not ordered.`);
      }
      befIdx = dataKey.idx;
      lines.push(data.amr_dfs);
    }

    writeCleanLines("data/outputs/ldc2017/amr", lines);
  }
}
