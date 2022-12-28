import {Command} from "@oclif/core";

export default class AmrGenCommand extends Command {
  static override description = `AMR text generate from linearized DFS AMRs.`;

  async run(): Promise<void> {
    this.log(`This is where I did it manually.`);
    this.log(`The steps:
1. Prepare linearized DFS AMRs in \`.jsonl\` with "sent" and "amr" keys.
2. Set "sent" value to empty string (""). (Can be done via \`amr-gen:prepare\`)
3. Rename the file to \`data4generation.jsonl\`
4. Prepare the data structure to be:
    AMRBART/examples/
    └── data4generation.jsonl
5. Go to \`AMRBART/fine-tune/\` as the working directory.
6. Run \`bash inference-text.sh "xfbai/AMRBART-large-finetuned-AMR3.0-AMR2Text-v2" \`.
7. Your result will be in \`AMRBART/fine-tune/outputs/Infer-examples-AMRBART-large-AMR2Text-bsz8-lr-2e-6-UnifiedInp/generated_predictions.txt\``);
  }
}
