import {Command, Flags} from "@oclif/core";
import {
  batchUpdate,
  Data,
  DataKey,
  dataColumns,
  dataSources,
  splits,
  Client,
} from "../../db.js";
import {readCleanedLines, readFile, splitChunk, tqdm2, zod} from "../../lib.js";

const confListValidator = zod
  .object({
    dataSource: zod.enum(dataSources),
    split: zod.enum(splits),
    key: zod.enum(dataColumns),
    filePathList: zod.string().array(),
  })
  .array()
  .min(1);

export default class IntegrateLinesCommand extends Command {
  static override description = `Integrate every line in files to DB.`;

  static override flags = {
    configFile: Flags.string({
      description: `Config file input (json).`,
      required: true,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(IntegrateLinesCommand);

    const confList = confListValidator.parse(
      JSON.parse(readFile(flags.configFile)),
    );

    this.log(`Processing the job...`);
    for (const conf of tqdm2(confList, {suffix: (v) => v.dataSource})) {
      await IntegrateLinesCommand.runProcess(
        {
          data_source: conf.dataSource,
          split: conf.split,
        },
        {
          inputFileList: conf.filePathList,
          key: conf.key,
        },
      );
    }

    this.log(`DONE.`);
  }

  static async runProcess(
    dataKey: Omit<DataKey, "idx">,
    o: {inputFileList: string[]; key: keyof Data},
  ): Promise<void> {
    const lines = o.inputFileList
      .map((inputFile) => readCleanedLines(inputFile))
      .flat();
    const batchValues = lines.map((v, i) => ({
      dataKey: {
        ...dataKey,
        idx: i,
      },
      data: {
        [o.key]: v,
      },
    }));
    for (const batchValue of splitChunk(batchValues, Client.MAX_CHUNK)) {
      await batchUpdate(batchValue);
    }
  }
}
