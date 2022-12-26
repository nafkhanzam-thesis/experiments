import {Command, Flags} from "@oclif/core";
import {AMRDataset, DataCategory} from "../../../constants.js";
import {cartesianProduct, listFormat, path} from "../../../lib.js";
import AmrProcessCommand from "../index.js";

const amrDatasets = listFormat(Object.values(AMRDataset));

export default class AmrProcessLdcCommand extends Command {
  static override description = `Convert ${amrDatasets} datasets to DFS linearized AMR.`;

  static override flags = {
    outDir: Flags.string({
      description: `Output directory.`,
      default: `outputs/amr-process-ldc`,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AmrProcessLdcCommand);

    const comb = cartesianProduct<[AMRDataset, DataCategory][]>(
      Object.values(AMRDataset),
      Object.values(DataCategory),
    );
    for (const [dataset, category] of comb) {
      const inputFile = path.join(
        `data`,
        String(dataset),
        `/data/amrs/split`,
        String(category),
        `*.txt`,
      );
      await AmrProcessCommand.run(
        [
          [`--glob`, inputFile],
          [`--outDir`, flags.outDir],
        ].flat(),
      );
    }
  }
}
