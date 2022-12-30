import {Command, Flags} from "@oclif/core";
import {commons} from "../../../../commons.js";
import {path, validateFileList} from "../../../../lib.js";
import AmrGenPrepareCommand from "../index.js";
import rawFileList from "./file-list.json" assert {type: "json"};

export default class AmrGenPrepareLdc2020Command extends Command {
  static override description = `Prepare linearized LDC2020 to amr4generation jsonl files.`;

  static override flags = {
    outDir: Flags.string({
      description: `Output directory.`,
      default: path.join(commons.OUTPUTS_DIRECTORY, `amr-gen/ldc2020`),
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AmrGenPrepareLdc2020Command);

    this.log(`Validating input files...`);
    const res = await validateFileList(rawFileList);
    if (!res.success) {
      return this.error(res.errorMsg, {
        exit: 1,
      });
    }

    this.log(`Generating amr4generation files...`);
    for (const filePath of res.filePaths) {
      AmrGenPrepareCommand.runProcess(
        [filePath],
        path.join(flags.outDir, path.basename(filePath)),
      );
    }

    this.log(`DONE.`);
  }
}
