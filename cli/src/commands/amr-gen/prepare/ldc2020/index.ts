import {Command, Flags} from "@oclif/core";
import {path, validateFileList} from "../../../../lib.js";
import AmrGenPrepare from "../index.js";
import rawFileList from "./file-list.json" assert {type: "json"};

export default class MergeCorporaEnId extends Command {
  static override description = `Prepare amr4generation jsonl files.`;

  static override flags = {
    outDir: Flags.string({
      description: `Output directory.`,
      default: `outputs/amr-gen/ldc2020`,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(MergeCorporaEnId);

    this.log(`Validating input files...`);
    const res = await validateFileList(rawFileList);
    if (!res.success) {
      return this.error(res.errorMsg, {
        exit: 1,
      });
    }

    this.log(`Generating amr4generation files...`);
    for (const filePath of res.filePaths) {
      AmrGenPrepare.runProcess(
        [filePath],
        path.join(flags.outDir, path.basename(filePath)),
      );
    }

    this.log(`DONE.`);
  }
}
