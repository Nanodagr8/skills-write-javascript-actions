import test from "node:test";
import assert from "node:assert/strict";
import { getJoke } from "../src/joke.js";

test("fetches a joke using JSON API headers and a timeout signal", async () => {
  let called = 0;
  const fetchStub = async (url, options) => {
    called++;
    assert.equal(url, "https://icanhazdadjoke.com/");
    assert.equal(options.headers.Accept, "application/json");
    assert.match(options.headers["User-Agent"], /GitHub Skills/i);
    assert.ok(options.signal, "request has timeout signal");
    return { ok: true, json: async () => ({ joke: "What is a Git branch? A tree-mendous idea." }) };
  };
  assert.equal(await getJoke(fetchStub), "What is a Git branch? A tree-mendous idea.");
  assert.equal(called, 1);
});

test("rejects non-200 API responses", async () => {
  await assert.rejects(
    getJoke(async () => ({ ok: false, status: 503 })),
    /503/
  );
});

test("rejects empty API joke payloads", async () => {
  await assert.rejects(
    getJoke(async () => ({ ok: true, json: async () => ({ joke: "  " }) })),
    /empty joke/i
  );
});
