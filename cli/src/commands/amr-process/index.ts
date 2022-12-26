import {Command, Flags} from "@oclif/core";
import {execaCommand, fs, globby, path, tqdmPromises} from "../../lib.js";

export default class AmrProcessCommand extends Command {
  static override description = `DFS linearize AMR.`;

  static override flags = {
    glob: Flags.string({
      description: `File globs.`,
      multiple: true,
      required: true,
    }),
    outDir: Flags.string({
      description: `Output directory.`,
      required: true,
    }),
    replace: Flags.boolean({
      description: `Replaces the output directory.`,
      default: false,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AmrProcessCommand);

    const filePaths = await globby(flags.glob);

    if (!filePaths.length) {
      const globsStr = flags.glob.map((v) => `> ${v}`).join("\n");
      return this.error(
        `No file(s) found with the provided globs:\n${globsStr}`,
      );
    }

    if (flags.replace) {
      this.log(`Deleting ${flags.outDir} directory...`);
      this.deleteExistingOutputs(flags.outDir);
    }

    this.log(`Processing the job...`);
    const promises: [string, Promise<void>][] = [];
    for (const filePath of filePaths) {
      promises.push([
        filePath,
        this.runScript({
          inputFile: filePath,
          outPrefix: path.join(flags.outDir, filePath),
        }),
      ]);
    }
    await tqdmPromises(promises);

    this.log(`DONE.`);
  }

  private async deleteExistingOutputs(outDir: string): Promise<void> {
    fs.removeSync(outDir);
  }

  private async runScript(a: {
    inputFile: string;
    outPrefix: string;
  }): Promise<void> {
    fs.ensureDirSync(path.dirname(a.outPrefix));
    const scriptStr = `python AMR-Process/read_and_process.py \
      --config AMR-Process/config-default.yaml \
      --input_file ${a.inputFile} \
      --output_prefix ${a.outPrefix}`;
    await execaCommand(scriptStr);
  }
}
