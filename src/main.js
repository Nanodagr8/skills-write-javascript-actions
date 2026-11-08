import { getJoke } from "./joke.js";
import * as core from "@actions/core";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export async function run(jokeFetcher = getJoke, actionCore = core) {
  try {
    const fetched = await jokeFetcher();
    if (typeof fetched !== "string" || fetched.trim() === "") {
      throw new Error("Joke fetcher returned an empty or invalid joke");
    }
    const joke = fetched.trim();
    actionCore.setOutput("joke", joke);
    return joke;
  } catch (error) {
    actionCore.setFailed("Unable to fetch joke: " + (error?.message ?? String(error)));
    return null;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  await run();
}
