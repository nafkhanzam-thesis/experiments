import {Command, Flags} from "@oclif/core";
import {execaCommand, fs, path} from "../../lib.js";

export default class MbseAmrParseCommand extends Command {
  static override description = `Parse to AMR.`;

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
    const {flags} = await this.parse(MbseAmrParseCommand);

    this.log(`Processing the job...`);
    await MbseAmrParseCommand.runProcess({
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
    const scriptStr = `python transition-amr-parser/transition_amr_parser/parse.py \
      --tokenize \
      -m amr3joint_ontowiki2_g2g-structured-bart-large \
      -i ${a.inputFile} \
      -o ${a.outputFile}`;
    await execaCommand(scriptStr);
  }
}
