import {Command, Flags} from "@oclif/core";
import {splitFileInto, validateFileList} from "../../lib.js";

export default class PrepareSplitCommand extends Command {
  static override description = `Split a file into batch files.`;

  static override flags = {
    inputFile: Flags.string({
      description: `Input file.`,
      required: true,
    }),
    outputDir: Flags.string({
      description: `Output directory.`,
      required: true,
    }),
    batch: Flags.integer({
      description: `Split texts to batches in case of failure.`,
      default: 10000,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(PrepareSplitCommand);

    this.log(`Validating input files...`);
    const res = await validateFileList([flags.inputFile]);
    if (!res.success) {
      return this.error(res.errorMsg, {
        exit: 1,
      });
    }

    const inputFile = res.filePaths[0];

    this.log(`Splitting into ${flags.batch} batches...`);
    await splitFileInto({
      inputFile,
      tempFolder: flags.outputDir,
      batch: flags.batch,
    });

    this.log(`DONE.`);
  }
}
