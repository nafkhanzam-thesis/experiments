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
    const lines: string[] = [];
    for (const filePath of filePaths) {
      this.log(`Reading ${filePath}...`);
      const nextLines = String(fs.readFileSync(filePath)).split("\n");
      lines.push(...nextLines);
    }
    fs.ensureFileSync(flags.out);
    fs.writeFileSync(flags.out, lines.join("\n"));

    this.log(`DONE.`);
  }
}
