import { parseArgs, printHelp } from "./args.js";
import { runPrompts } from "./prompts.js";
import { scaffold } from "./generators/scaffold.js";
import {
  addComponent,
  parseAddComponentArgs,
} from "./commands/add-component.js";
import { addHook, parseAddHookArgs } from "./commands/add-hook.js";
import { addBlock, parseAddBlockArgs } from "./commands/add-block.js";
import { addTheme, parseAddThemeArgs } from "./commands/add-theme.js";
import { addFile, parseAddFileArgs } from "./commands/add-file.js";
import { eject, parseEjectArgs } from "./commands/eject.js";
import { remove, parseRemoveArgs } from "./commands/remove.js";
import { list, parseListArgs } from "./commands/list.js";
import { build } from "./commands/build.js";
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

  if (command === "add-theme") {
    const args = parseAddThemeArgs(process.argv);
    await addTheme(args);
    return;
  }

  if (command === "add-file") {
    const args = parseAddFileArgs(process.argv);
    await addFile(args);
    return;
  }

  if (command === "eject") {
    const args = parseEjectArgs(process.argv);
    await eject(args);
    return;
  }

  if (command === "remove") {
    const args = parseRemoveArgs(process.argv);
    await remove(args);
    return;
  }

  if (command === "list") {
    const args = parseListArgs(process.argv);
    await list(args);
    return;
  }

  if (command === "build") {
    await build();
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
