import {Command, Flags} from "@oclif/core";
import {
  batchUpdate,
  BatchValue,
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
  splitChunkAuto,
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

    this.log(`Processing the ${confList.length} job(s)...`);
    for (const conf of confList) {
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

        let lines = readCleanedLines(filePath, false);

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
    const batchValues: BatchValue[] = lines.map((v, i) => ({
      dataKey: {
        ...dataKey,
        idx: i,
      },
      data: {
        [o.key]: v,
      },
    }));

    const chunks = tqdm2Chunk(
      splitChunkAuto(batchValues, Client.MAX_CHUNK),
      batchValues.length,
    );

    console.log(
      `${dataKey.data_source}-${dataKey.split}-${o.key}-(${lines.length} lines)`,
    );
    for (const batchValue of chunks) {
      await batchUpdate(batchValue);
    }
  }
}
