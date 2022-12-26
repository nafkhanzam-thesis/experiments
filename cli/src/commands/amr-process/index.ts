import {Command, Flags} from "@oclif/core";
import {execaCommand, fs, path} from "../../lib.js";

export default class AmrProcessCommand extends Command {
  static override description = `DFS linearize AMR.`;

  static override flags = {
    globInput: Flags.string({
      description: `File glob as input.`,
      required: true,
    }),
    outPrefix: Flags.string({
      description: `Output prefix files.`,
      required: true,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AmrProcessCommand);

    this.log(`Processing the job...`);
    await AmrProcessCommand.runScript({
      globInput: flags.globInput,
      outPrefix: flags.outPrefix,
    });

    this.log(`DONE.`);
  }

  static async runScript(a: {
    globInput: string;
    outPrefix: string;
  }): Promise<void> {
    fs.ensureDirSync(path.dirname(a.outPrefix));
    const scriptStr = `python AMR-Process/read_and_process.py \
      --config AMR-Process/config-default.yaml \
      --input_file ${a.globInput} \
      --output_prefix ${a.outPrefix}`;
    await execaCommand(scriptStr);
  }
}
