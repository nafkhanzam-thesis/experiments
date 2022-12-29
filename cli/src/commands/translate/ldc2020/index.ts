import {Command, Flags} from "@oclif/core";
import {fs, splitFileInto, tqdm2, validateFileList} from "../../../lib";
import TranslateToIdCommand from "../to-id";

export default class TranslateLdc2020Command extends Command {
  static override description = `Translate LDC2020 train and dev + alternatives into Indonesian texts.`;

  static override flags = {
    inputFile: Flags.string({
      description: `Input file.`,
      default: `outputs/translate/ldc2020-train-dev+alternatives.en`,
    }),
    outputFile: Flags.string({
      description: `Output file.`,
      default: `outputs/translate/ldc2020-train-dev+alternatives.id`,
    }),
    batch: Flags.integer({
      description: `Split texts to batches in case of failure.`,
      default: 10000,
    }),
    tempFolder: Flags.string({
      description: `Temporary directory for splitted batches.`,
      default: `outputs/tmp`,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(TranslateLdc2020Command);

    this.log(`Validating input files...`);
    const res = await validateFileList([flags.inputFile]);
    if (!res.success) {
      return this.error(res.errorMsg, {
        exit: 1,
      });
    }

    const inputFile = res.filePaths[0];

    this.log(`Splitting into ${flags.batch} batches...`);
    const splitFiles = await splitFileInto({
      inputFile,
      tempFolder: flags.tempFolder,
      batch: flags.batch,
    });

    this.log(`Translating...`);
    const outFiles: string[] = [];
    for (const splitFile of tqdm2(splitFiles, {suffix: (v) => v})) {
      const outFile = `${splitFile}.out`;
      outFiles.push(outFile);
      if (fs.existsSync(outFile)) {
        this.log(`Skipping "${outFile}" as it already exists...`);
        continue;
      }
      await TranslateToIdCommand.runProcess({
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

    this.log(`DONE.`);
  }
}
