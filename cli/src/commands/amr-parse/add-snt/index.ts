import {Command, Flags} from "@oclif/core";
import {fs, path} from "../../../lib.js";

export default class AmrParseAddSntCommand extends Command {
  static override description = `Parse to AMR.`;

  static override flags = {
    inputFile: Flags.string({
      description: `Input file.`,
      required: true,
    }),
    sentencesFile: Flags.string({
      description: `Input sentences file.`,
      required: true,
    }),
    outputFile: Flags.string({
      description: `Output file.`,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AmrParseAddSntCommand);

    this.log(`Processing the job...`);
    await AmrParseAddSntCommand.runProcess({
      inputFile: flags.inputFile,
      sentencesFile: flags.sentencesFile,
      outputFile: flags.outputFile ?? flags.inputFile,
    });

    this.log(`DONE.`);
  }

  static async runProcess(a: {
    inputFile: string;
    sentencesFile: string;
    outputFile: string;
  }): Promise<void> {
    fs.ensureDirSync(path.dirname(a.outputFile));
    const lines = String(fs.readFileSync(a.inputFile)).split("\n");
    const sentences = String(fs.readFileSync(a.sentencesFile)).split("\n");
    const processedLines: string[] = [];
    let i = 0;
    const TOK_PREFIX = "# ::tok ";
    for (const line of lines) {
      processedLines.push(line);
      if (line.startsWith(TOK_PREFIX)) {
        processedLines.push(`# ::snt ${sentences[i++]}`);
      }
    }
    fs.writeFileSync(a.outputFile, processedLines.join("\n"));
  }
}
