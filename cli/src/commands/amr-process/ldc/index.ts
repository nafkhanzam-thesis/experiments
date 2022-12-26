import {Command, Flags} from "@oclif/core";
import {AMRDataset, DataCategory} from "../../../constants.js";
import {
  cartesianProduct,
  isValidFile,
  listFormat,
  path,
  zod,
} from "../../../lib.js";
import AmrProcessCommand from "../index.js";
import rawLdcFileList from "./file-list.json" assert {type: "json"};

const amrDatasets = listFormat(Object.values(AMRDataset));

export default class AmrProcessLdcCommand extends Command {
  static override description = `Convert ${amrDatasets} datasets to DFS linearized AMR.`;

  static override flags = {
    dataDir: Flags.string({
      description: `Data directory.`,
      default: `data/`,
    }),
    outDir: Flags.string({
      description: `Output directory.`,
      default: `outputs/amr-process-ldc`,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AmrProcessLdcCommand);

    this.log("Validating input files...");
    await this.validateInput(flags.dataDir);

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

  private async validateInput(dataDir: string): Promise<void> {
    const inputValidation = zod.string().array().parse(rawLdcFileList);
    const notFoundList: string[] = [];
    for (const filePath of inputValidation) {
      const filePathRef = path.join(dataDir, filePath);
      if (!isValidFile(filePathRef)) {
        notFoundList.push(filePathRef);
      }
    }

    if (notFoundList.length > 0) {
      const notFoundListStr = notFoundList.map((v) => `> ${v}`).join("\n");
      return this.error(`This file(s) was not found:\n${notFoundListStr}`, {
        exit: 1,
      });
    }
  }
}
