import {Command, Flags} from "@oclif/core";
import {fs, tqdm2, validateFileList} from "../../../../lib.js";
import rawFileList from "./file-list.json" assert {type: "json"};

export default class TranslateLdc2020PrepareCommand extends Command {
  static override description = `Prepare LDC2020 train and dev + alternatives English texts.`;

  static override flags = {
    outputFile: Flags.string({
      description: `Output file.`,
      default: `outputs/translate/ldc2020-train-dev+alternatives.en`,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(TranslateLdc2020PrepareCommand);

    this.log(`Validating input files...`);
    const res = await validateFileList(rawFileList);
    if (!res.success) {
      return this.error(res.errorMsg, {
        exit: 1,
      });
    }

    this.log(`Merging files...`);
    fs.ensureFileSync(flags.outputFile);
    const concatted: string[] = [];
    for (const filePath of tqdm2(res.filePaths)) {
      const readLine = String(fs.readFileSync(filePath));
      concatted.push(readLine.trim().replaceAll(/<.*>.*?/gi, ""));
    }
    fs.writeFileSync(flags.outputFile, concatted.join(""));

    this.log(`DONE.`);
  }
}
