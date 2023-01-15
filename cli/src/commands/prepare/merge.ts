import {Command, Flags} from "@oclif/core";
import {fs, globby, tqdm2} from "../../lib.js";

export default class PrepareMergeCommand extends Command {
  static override description = `Merge batch files into a file.`;

  static override flags = {
    inputRegex: Flags.string({
      description: `Input regex.`,
      multiple: true,
      required: true,
    }),
    outputFile: Flags.string({
      description: `Output file.`,
      required: true,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(PrepareMergeCommand);

    this.log(`Validating input files...`);
    const fileList = await globby(flags.inputRegex);
    if (!fileList.length) {
      return this.error(
        `No file was found with the provided regular expression.`,
      );
    }

    this.log(`Merging from ${fileList.length} batches...`);
    fs.ensureFileSync(flags.outputFile);
    const concatted: Buffer[] = [];
    for (const file of tqdm2(fileList)) {
      const readBuf = fs.readFileSync(file);
      concatted.push(readBuf);
    }
    fs.writeFileSync(flags.outputFile, concatted.join("\n"));

    this.log(`DONE.`);
  }
}
