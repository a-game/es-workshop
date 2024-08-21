import getEsClient from "./es-client.js";
import ora from "ora";
import { input, select, Separator } from "@inquirer/prompts";
import chalk from "chalk";

const client = await getEsClient();
async function bulkIndex() {
  const index = await input({
    message: "Enter index name",
    required: true,
  });
  const spinner = ora("Checking index...").start();
  const exists = await client.indices.exists({ index });
  if (!exists) {
    spinner.fail(`index doesn't exist, ${index}`);
    return;
  }

  try {
    const data = [];
    for (let i = 0; i < 25; i++) {
      const { default: d } = await import(`../data/m${i}.json`, {
        assert: { type: "json" },
      });

      data.push(...d);
    }

    spinner.text = `Indexing ${data.length} documents...`;
    const result = await client.helpers.bulk({
      datasource: data,
      onDocument: (doc) => ({ index: { _index: index, _id: doc.id } }),
    });
    spinner.succeed("done!");
    console.log(result);
  } catch (error) {
    spinner.fail(chalk.red((error as Error).message));
  }
}

while (true) {
  const action = await select({
    message: "What would you like to do?",
    choices: [
      { name: "Index movies", value: "index" },
      new Separator(),
      { name: "Quit", value: "quit" },
    ],
  });

  switch (action) {
    case "index":
      await bulkIndex();
      break;

    default:
      process.exit(0);
  }
}
