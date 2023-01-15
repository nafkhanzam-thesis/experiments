import {Command, Flags} from "@oclif/core";
import {fs, globby, readCleanedLines, writeCleanLines} from "../../../lib.js";

export default class AmrParsePrepareCommand extends Command {
  static override description = `Prepare data4parsing jsonl file.`;

  static override flags = {
    glob: Flags.string({
      description: `File globs.`,
      multiple: true,
      required: true,
    }),
    out: Flags.string({
      description: `Output file.`,
      required: true,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AmrParsePrepareCommand);

    const filePaths = await globby(flags.glob);

    if (!filePaths.length) {
      const globsStr = flags.glob.map((v) => `> ${v}`).join("\n");
      return this.error(
        `No file(s) found with the provided globs:\n${globsStr}`,
      );
    }

    this.log(`Processing the job...`);
    AmrParsePrepareCommand.runProcess(filePaths, flags.out);

    this.log("DONE.");
  }

  static runProcess(filePaths: string[], out: string): void {
    fs.ensureFileSync(out);
    const lines = filePaths.map((v) => readCleanedLines(v)).flat();
    for (let i = 0; i < lines.length; ++i) {
      lines[i] = JSON.stringify({sent: lines[i], amr: ""});
    }
    writeCleanLines(out, lines);
  }
}
