import {Command, Flags} from "@oclif/core";
import {commons} from "../../../commons.js";
import {path, validateFileList} from "../../../lib.js";
import MergeCorpora from "../index.js";
import rawCorporaEnFileList from "./file-list.en.json" assert {type: "json"};
import rawCorporaIdFileList from "./file-list.id.json" assert {type: "json"};

const rawFileLists: [string, unknown][] = [
  [`en`, rawCorporaEnFileList],
  [`id`, rawCorporaIdFileList],
];

export default class MergeCorporaEnId extends Command {
  static override description = `Merge parallel corpora en id into a single file.`;

  static override flags = {
    outDir: Flags.string({
      description: `Output directory.`,
      default: path.join(
        commons.OUTPUTS_DIRECTORY,
        `merge-parallel-corpora-en-id`,
      ),
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(MergeCorporaEnId);

    for (const [label, rawFileList] of rawFileLists) {
      await this.processSingleLang(flags.outDir, label, rawFileList);
    }

    this.log(`DONE.`);
  }

  async processSingleLang(
    outDir: string,
    label: string,
    rawFileList: unknown,
  ): Promise<void> {
    this.log(`Validating ${label} input files...`);
    const res = await validateFileList(rawFileList);
    if (!res.success) {
      return this.error(res.errorMsg, {
        exit: 1,
      });
    }

    this.log(`Processing ${label} corpora...`);
    MergeCorpora.runProcess(
      res.filePaths,
      path.join(outDir, `corpora.${label}.txt`),
    );
  }
}
