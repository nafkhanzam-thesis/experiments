import {Command} from "@oclif/core";
import {dfd} from "../lib.js";

export default class SandboxCommand extends Command {
  async run(): Promise<void> {
    const df = await dfd.readCSV(
      "/home/nafkhanzam/kode/nafkhanzam/thesis/dsbulk/data-wo-labse/output-000004.csv",
    );

    const colName = "en__en_back__bleu";
    const df_filtered = df.query(df.column("split").eq("dev" as any));
    const col = df_filtered.column(colName);
    const sum = col.asType("float32").sum();
    const count = col.asType("float32").count();
    const avg = sum / count;
    console.log({sum, count, avg});
  }
}
