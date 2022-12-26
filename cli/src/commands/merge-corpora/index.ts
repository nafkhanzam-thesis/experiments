import {Command, Flags} from "@oclif/core";
import {fs, globby} from "../../lib.js";

export default class MergeCorpora extends Command {
  static override description = `Merge corpora into a single file.`;

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
    const {flags} = await this.parse(MergeCorpora);

    const filePaths = await globby(flags.glob);

    if (!filePaths.length) {
      const globsStr = flags.glob.map((v) => `> ${v}`).join("\n");
      return this.error(
        `No file(s) found with the provided globs:\n${globsStr}`,
      );
    }

    this.log(`Processing the job...`);
    MergeCorpora.runProcess(filePaths, flags.out);

    this.log("DONE.");
  }

  static runProcess(filePaths: string[], out: string): void {
    const lines: string[] = [];
    for (const filePath of filePaths) {
      const nextLines = String(fs.readFileSync(filePath)).split("\n");
      lines.push(...nextLines);
    }
    fs.ensureFileSync(out);
    fs.writeFileSync(out, lines.join("\n"));
  }
}
