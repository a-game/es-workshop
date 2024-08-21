import { config as loadEnv } from "dotenv";
import { input } from "@inquirer/prompts";
import * as fs from "fs/promises";
import { Client } from "@elastic/elasticsearch";

let client: Client | null = null;

export default async function getEsClient() {
  loadEnv();

  let { ES_ENDPOINT, ES_API_ID, ES_API_KEY } = process.env;

  if (!ES_ENDPOINT) {
    const answer = await input({
      message: "Please enter your elastic endpoint",
      required: true,
    });

    ES_ENDPOINT = answer;
    await fs.appendFile(".env", `\nES_ENDPOINT="${answer}"`);
  }

  if (!ES_API_ID) {
    const answer = await input({
      message: "Please enter your elastic api id",
      required: true,
    });

    ES_API_ID = answer;
    await fs.appendFile(".env", `\nES_API_ID="${answer}"`);
  }

  if (!ES_API_KEY) {
    const answer = await input({
      message: "Please enter your elastic api key",
      required: true,
    });

    ES_API_KEY = answer;
    await fs.appendFile(".env", `\nES_API_KEY="${answer}"`);
  }
  if (!client) {
    const ca = await fs.readFile("./http_ca.crt");
    client = new Client({
      node: ES_ENDPOINT,
      auth: { apiKey: { id: ES_API_ID!, api_key: ES_API_KEY! } },
      tls: { ca, rejectUnauthorized: false },
    });
  }

  return client;
}
