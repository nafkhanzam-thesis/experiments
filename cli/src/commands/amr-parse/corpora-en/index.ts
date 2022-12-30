import {Command, Flags} from "@oclif/core";
import {commons} from "../../../commons";
import {fs, path, splitFileInto, tqdm2, validateFileList} from "../../../lib";
import AmrParseAddSntCommand from "../add-snt";
import MbseAmrParseCommand from "../mbse";

export default class AmrParseCorporaEnCommand extends Command {
  static override description = `Parse corpora-en to AMR.`;

  static override flags = {
    inputFile: Flags.string({
      description: `Input file.`,
      required: true,
      default: path.join(
        commons.OUTPUTS_DIRECTORY,
        `merge-parallel-corpora-en-id/corpora.en.txt`,
      ),
    }),
    outputFile: Flags.string({
      description: `Output file.`,
      required: true,
      default: path.join(
        commons.OUTPUTS_DIRECTORY,
        `amr-parse/mbse/corpora.en.amr`,
      ),
    }),
    batch: Flags.integer({
      description: `Split texts to batches in case of failure.`,
      default: 32,
    }),
    tempFolder: Flags.string({
      description: `Temporary directory for splitted batches.`,
      default: commons.TMP_DIRECTORY,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AmrParseCorporaEnCommand);

    this.log(`Validating input files...`);
    const res = await validateFileList([flags.inputFile]);
    if (!res.success) {
      return this.error(res.errorMsg, {
        exit: 1,
      });
    }

    this.log(`Splitting into ${flags.batch} batches...`);
    const splitFiles = await splitFileInto({
      inputFile: flags.inputFile,
      tempFolder: flags.tempFolder,
      batch: flags.batch,
    });

    this.log(`Converting to AMR...`);
    const outFiles: string[] = [];
    for (const splitFile of splitFiles) {
      const outFile = `${splitFile}.out`;
      outFiles.push(outFile);
      if (fs.existsSync(outFile)) {
        this.log(`Skipping "${outFile}" as it already exists...`);
        continue;
      }
      await MbseAmrParseCommand.runProcess({
        inputFile: splitFile,
        outputFile: outFile,
      });
    }

    this.log(`Merging results...`);
    fs.ensureFileSync(flags.outputFile);
    const concatted: Buffer[] = [];
    for (const outFile of tqdm2(outFiles)) {
      const readBuf = fs.readFileSync(outFile);
      concatted.push(readBuf);
    }
    fs.writeFileSync(flags.outputFile, concatted.join(""));

    this.log(`Adding sentences...`);
    AmrParseAddSntCommand.runProcess({
      inputFile: flags.outputFile,
      sentencesFile: flags.inputFile,
      outputFile: flags.outputFile,
    });

    this.log(`DONE.`);
  }
}
