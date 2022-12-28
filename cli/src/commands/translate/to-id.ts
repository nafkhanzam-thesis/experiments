import {Command, Flags} from "@oclif/core";
import {execaCommand, fs, path} from "../../lib.js";

export default class TranslateToIdCommand extends Command {
  static override description = `Translate to Indonesia.`;

  static override flags = {
    inputFile: Flags.string({
      description: `Input file.`,
      required: true,
    }),
    outputFile: Flags.string({
      description: `Output file.`,
      required: true,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(TranslateToIdCommand);

    this.log(`Processing the job...`);
    await TranslateToIdCommand.runProcess({
      inputFile: flags.inputFile,
      outputFile: flags.outputFile,
    });

    this.log(`DONE.`);
  }

  static async runProcess(a: {
    inputFile: string;
    outputFile: string;
  }): Promise<void> {
    fs.ensureDirSync(path.dirname(a.outputFile));
    const scriptStr = `python scripts/translate.py \
      -i ${a.inputFile} \
      -o ${a.outputFile}`;
    await execaCommand(scriptStr);
  }
}
