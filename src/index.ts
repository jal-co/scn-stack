import { parseArgs, printHelp } from "./args.js";
import { runPrompts } from "./prompts.js";
import { scaffold } from "./generators/scaffold.js";
import {
  addComponent,
  parseAddComponentArgs,
} from "./commands/add-component.js";

async function main() {
  const command = process.argv[2];

  // Subcommands
  if (command === "add-component") {
    const args = parseAddComponentArgs(process.argv);
    await addComponent(args);
    return;
  }

  if (command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  // Default: scaffold a new project
  const args = parseArgs(process.argv);

  if (args.help) {
    printHelp();
    return;
  }

  const config = await runPrompts(args);
  await scaffold(config);
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
