import { runPrompts } from "./prompts.js";
import { scaffold } from "./generators/scaffold.js";

async function main() {
  const config = await runPrompts();
  await scaffold(config);
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
