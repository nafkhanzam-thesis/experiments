import {Command, Flags} from "@oclif/core";
import {fs, path} from "../../../lib.js";

export default class AmrParseAddSntCommand extends Command {
  static override description = `Parse to AMR.`;

  static override flags = {
    inputFile: Flags.string({
      description: `Input file.`,
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
      outputFile: flags.outputFile ?? flags.inputFile,
    });

    this.log(`DONE.`);
  }

  static async runProcess(a: {
    inputFile: string;
    outputFile: string;
  }): Promise<void> {
    fs.ensureFileSync(a.inputFile);
    fs.ensureDirSync(path.dirname(a.outputFile));
    const lines = String(fs.readFileSync(a.inputFile)).split("\n");
    const processedLines: string[] = [];
    const TOK_PREFIX = "# ::tok ";
    for (const line of lines) {
      processedLines.push(line);
      if (line.startsWith(TOK_PREFIX)) {
        processedLines.push(`# ::snt ${line.slice(TOK_PREFIX.length)}`);
      }
    }
    fs.writeFileSync(a.outputFile, processedLines.join("\n"));
  }
}
