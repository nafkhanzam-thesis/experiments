import {Command, Flags} from "@oclif/core";
import {AMRDataset} from "../../../constants.js";
import {listFormat} from "../../../lib.js";
import AmrProcessCommand from "../index.js";

const amrDatasets = listFormat(Object.values(AMRDataset));

export default class AmrProcessCorporaCommand extends Command {
  static override description = `Convert ${amrDatasets} datasets to DFS linearized AMR.`;

  static override flags = {
    inputFile: Flags.string({
      description: `Input file.`,
      default: `outputs/amr-parse/mbse/corpora.en.amr`,
    }),
    outDir: Flags.string({
      description: `Output directory.`,
      default: `outputs/amr-process/corpora`,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AmrProcessCorporaCommand);

    await AmrProcessCommand.runScript({
      globInput: flags.inputFile,
      outPrefix: flags.outDir,
    });
  }
}
