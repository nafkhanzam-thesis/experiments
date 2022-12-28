import {Command, Flags} from "@oclif/core";
import {fs, path, tqdm, validateFileList} from "../../../lib";
import MbseAmrParseCommand from "../mbse";
import rawFileList from "./file-list.json" assert {type: "json"};

export default class AmrParseCorporaEnCommand extends Command {
  static override description = `Parse corpora-en to AMR.`;

  static override flags = {
    inputFile: Flags.string({
      description: `Input file.`,
      required: true,
      default: `outputs/merge-parallel-corpora-en-id/corpora.en.txt`,
    }),
    outputFile: Flags.string({
      description: `Output file.`,
      required: true,
      default: `outputs/amr-parse/mbse/corpora.en.amr`,
    }),
    batch: Flags.integer({
      description: `Split texts to batches in case of failure.`,
      default: 4,
    }),
    tempFolder: Flags.string({
      description: `Temporary directory for splitted batches.`,
      default: `outputs/tmp`,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AmrParseCorporaEnCommand);

    this.log(`Validating input files...`);
    const res = await validateFileList(rawFileList);
    if (!res.success) {
      return this.error(res.errorMsg, {
        exit: 1,
      });
    }

    this.log(`Splitting into ${flags.batch} batches...`);
    const splitFiles = await this.split({
      inputFile: flags.inputFile,
      tempFolder: flags.tempFolder,
      batch: flags.batch,
    });

    this.log(`Converting to AMR...`);
    const outFiles: string[] = [];
    for (const splitFile of tqdm(splitFiles)) {
      const outFile = path.join(`${splitFile}.out`);
      outFiles.push(outFile);
      if (fs.existsSync(outFile)) {
        continue;
      }
      await MbseAmrParseCommand.runProcess({
        inputFile: splitFile,
        outputFile: outFile,
      });
    }

    // this.log(`Merging results...`);
    // fs.ensureFileSync(flags.outputFile);
    // const mergeStream = fs.createWriteStream(flags.outputFile);
    // for (const outFile of outFiles) {
    //   const readStream = fs.createReadStream(outFile);
    //   readStream.pipe(mergeStream);
    //   await new Promise((resolve, reject) => {
    //     readStream.on("end", resolve);
    //     readStream.on("close", reject);
    //   });
    // }

    this.log(`DONE.`);
  }

  private async split(a: {
    inputFile: string;
    tempFolder: string;
    batch: number;
  }): Promise<string[]> {
    const tmpFileList: string[] = [];

    const lines = String(fs.readFileSync(a.inputFile)).split("\n");
    let stream: fs.WriteStream | null = null;
    let currBatch = 0;
    for (let i = 0; i < lines.length; ++i) {
      const line = lines[i];
      if (i > Math.ceil(lines.length / a.batch) * (currBatch + 1)) {
        ++currBatch;
        if (stream) {
          stream.end();
          await new Promise((resolve, reject) => {
            if (stream) {
              stream.on("finish", resolve);
              stream.on("close", reject);
              return;
            }
            reject(new Error(`stream is null.`));
          });
          stream = null;
        }
      }
      if (!stream) {
        const tmpFile = path.join(a.tempFolder, a.inputFile, String(currBatch));
        // if (fs.existsSync(tmpFile)) {
        //   continue;
        // }
        fs.ensureFileSync(tmpFile);
        tmpFileList.push(tmpFile);
        stream = fs.createWriteStream(tmpFile);
      }
      if (line.length > 0) {
        stream.write(line);
        stream.write("\n");
      }
    }

    return tmpFileList;
  }
}
