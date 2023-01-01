import {Command, Flags} from "@oclif/core";
import {dfd, fs, writeCleanLines} from "../../lib.js";

const orders = ["consensus", "xinhua", "dfa", "proxy", "bolt"];

export default class PrepareLdc2017TestCommand extends Command {
  static override description =
    "Reorder LDC2020 test id translation in the correct order.";

  static override flags = {
    inputFile: Flags.string({
      description: `Input file.`,
      default: `data/original/amr-release-2.0-amrs-test-all.sentences.ms.txt`,
    }),
    outputFile: Flags.string({
      description: `Output file.`,
      default: `data/outputs/translate/ldc2017-test.id`,
    }),
  };

  public async run(): Promise<void> {
    const {flags} = await this.parse(PrepareLdc2017TestCommand);

    fs.existsSync(flags.inputFile);
    // @ts-expect-error delimiter exists.
    let df = await dfd.readCSV(flags.inputFile, {delimiter: ";"});
    df = df.addColumn(
      `key_order`,
      df.column(`key`).map((v) => orders.indexOf(v)),
    );
    df = df.sortValues(`key_order`);
    const idList = df.column(`translation`).values;
    fs.ensureFileSync(flags.outputFile);
    writeCleanLines(
      flags.outputFile,
      idList.flat().map((v) => String(v)),
    );

    this.log(`DONE.`);
  }
}
