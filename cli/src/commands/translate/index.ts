import {Command, Flags} from "@oclif/core";
import {execaCommand, fs, path} from "../../lib.js";

const MODEL_OPTIONS = ["en-id", "id-en"] as const;

export default class TranslateCommand extends Command {
  static override description = `Translate to Indonesia.`;

  static override flags = {
    model: Flags.enum({
      description: `Translation model.`,
      required: true,
      options: [...MODEL_OPTIONS],
      multiple: false,
    }),
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
    const {flags} = await this.parse(TranslateCommand);

    this.log(`Processing the job...`);
    await TranslateCommand.runProcess({
      model: flags.model,
      inputFile: flags.inputFile,
      outputFile: flags.outputFile,
    });

    this.log(`DONE.`);
  }

  static async runProcess(a: {
    model: "en-id" | "id-en";
    inputFile: string;
    outputFile: string;
  }): Promise<void> {
    fs.ensureDirSync(path.dirname(a.outputFile));
    const scriptStr = `python scripts/translate-cpu.py \
      -m ${a.model} \
      -i ${a.inputFile} \
      -o ${a.outputFile}`;
    await execaCommand(scriptStr);
  }
}
