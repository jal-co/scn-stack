import { parseArgs, printHelp } from "./args.js";
import { runPrompts } from "./prompts.js";
import { scaffold } from "./generators/scaffold.js";
import {
  addComponent,
  parseAddComponentArgs,
} from "./commands/add-component.js";
import { addHook, parseAddHookArgs } from "./commands/add-hook.js";
import { addBlock, parseAddBlockArgs } from "./commands/add-block.js";
import { init, parseInitArgs } from "./commands/init.js";

async function main() {
  const command = process.argv[2];

  // Subcommands
  if (command === "add-component") {
    const args = parseAddComponentArgs(process.argv);
    await addComponent(args);
    return;
  }

  if (command === "add-hook") {
    const args = parseAddHookArgs(process.argv);
    await addHook(args);
    return;
  }

  if (command === "add-block") {
    const args = parseAddBlockArgs(process.argv);
    await addBlock(args);
    return;
  }

  if (command === "init") {
    const args = parseInitArgs(process.argv);
    await init(args);
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
