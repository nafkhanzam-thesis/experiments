import {Command, Flags} from "@oclif/core";
import {
  batchUpdate,
  Client,
  Data,
  dataColumns,
  DataKey,
  dataSources,
  splits,
} from "../../db.js";
import {
  readCleanedLines,
  readFile,
  sizeof,
  splitChunk,
  tqdm2,
  tqdm2Chunk,
  zod,
} from "../../lib.js";

const confListValidator = zod
  .object({
    dataSource: zod.enum(dataSources),
    split: zod.enum(splits),
    key: zod.enum(dataColumns),
    filePathList: zod
      .union([
        zod.string(),
        zod.tuple([zod.string(), zod.number()]),
        zod.tuple([zod.string(), zod.number(), zod.number()]),
      ])
      .array(),
  })
  .array()
  .min(1);

type ConfList = zod.infer<typeof confListValidator>;

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
    o: {inputFileList: ConfList[number]["filePathList"]; key: keyof Data},
  ): Promise<void> {
    const lines: string[] = o.inputFileList
      .map((entry) => {
        let filePath: string;
        if (typeof entry === "string") {
          filePath = entry;
        } else {
          filePath = entry[0];
        }

        let lines = readCleanedLines(filePath);

        if (Array.isArray(entry)) {
          if (entry.length == 3) {
            lines = lines.slice(entry[1], entry[1] + entry[2]);
          } else {
            lines = lines.slice(entry[1]);
          }
        }

        return lines;
      })
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

    const totalSize = batchValues.reduce(
      (prev, curr) => prev + sizeof(curr),
      0,
    );

    const chunks = tqdm2Chunk(
      splitChunk(
        batchValues,
        Math.floor((Client.MAX_CHUNK * batchValues.length) / totalSize),
      ),
      lines.length,
    );
    for (const batchValue of chunks) {
      await batchUpdate(batchValue);
    }
  }
}
