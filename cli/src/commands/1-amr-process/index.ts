import {Command, Flags} from "@oclif/core";
import {AMRDataset, DataCategory} from "../../constants.js";
import {
  cartesianProduct,
  execaCommand,
  fs,
  isValidFile,
  listFormat,
  tqdmPromises,
  path,
  zod,
} from "../../lib.js";
import rawInputValidation from "./input-validation.json" assert {type: "json"};

const amrDatasets = listFormat(Object.values(AMRDataset));

export default class AmrProcessCommand extends Command {
  static override description = `Convert ${amrDatasets} datasets to DFS linearized AMR.`;

  static override flags = {
    dataDir: Flags.string({
      description: `Data directory.`,
      default: `data/`,
    }),
    outDir: Flags.string({
      description: `Output directory.`,
      default: `outputs/1-amr-process`,
    }),
    replace: Flags.boolean({
      description: `Replaces the output directory.`,
      default: true,
    }),
  };

  async run(): Promise<void> {
    const {flags} = await this.parse(AmrProcessCommand);

    this.log("Validating input files...");
    await this.validateInput(flags.dataDir);

    if (flags.replace) {
      this.log(`Deleting ${flags.outDir} directory...`);
      this.deleteExistingOutputs(flags.outDir);
    }

    this.log(`Processing the job...`);
    await this.processJob(flags.outDir);

    this.log(`1-amr-process done!`);
  }

  private async validateInput(dataDir: string): Promise<void> {
    const inputValidation = zod.string().array().parse(rawInputValidation);
    const notFoundList: string[] = [];
    for (const filePath of inputValidation) {
      const filePathRef = path.join(dataDir, filePath);
      if (!isValidFile(filePathRef)) {
        notFoundList.push(filePathRef);
      }
    }

    if (notFoundList.length > 0) {
      const notFoundListStr = notFoundList.map((v) => `> ${v}`).join("\n");
      return this.error(`This file(s) was not found:\n${notFoundListStr}`, {
        exit: 1,
      });
    }
  }

  private async deleteExistingOutputs(outDir: string): Promise<void> {
    fs.removeSync(outDir);
  }

  private async processJob(outDir: string): Promise<void> {
    const comb = cartesianProduct<[AMRDataset, DataCategory][]>(
      Object.values(AMRDataset),
      Object.values(DataCategory),
    );
    const promises: [string, Promise<void>][] = [];
    for (const [dataset, category] of comb) {
      promises.push([
        `${dataset}/${category}`,
        this.runScript(outDir, dataset, category),
      ]);
    }
    await tqdmPromises(promises);
  }

  private async runScript(
    outDir: string,
    dataset: AMRDataset,
    category: DataCategory,
  ): Promise<void> {
    const inputFile = path.join(
      `data`,
      String(dataset),
      `/data/amrs/split`,
      String(category),
      `*.txt`,
    );
    const outDir2 = path.join(outDir, String(dataset));
    fs.ensureDirSync(outDir2);
    const outPrefix = path.join(outDir2, String(category));
    const scriptStr = `python AMR-Process/read_and_process.py \
      --config AMR-Process/config-default.yaml \
      --input_file ${inputFile} \
      --output_prefix ${outPrefix}`;
    await execaCommand(scriptStr);
  }
}
