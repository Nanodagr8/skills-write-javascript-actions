import test from "node:test";
import assert from "node:assert/strict";
import { run } from "../src/main.js";

test("GitHub Action exports joke into the declared output", async () => {
  const writes=[];
  const core={ setOutput(name,value){writes.push([name,value])},setFailed(message){ throw new Error(message) } };
  const joke = await run(async () => "A deterministic test joke", core);
  assert.equal(joke,"A deterministic test joke");
  assert.deepEqual(writes,[["joke","A deterministic test joke"]]);
});

test("network errors produce a failed action without leaking secrets", async () => {
  let failure = "";
  const core={ setOutput(){throw new Error("Unexpected output")},setFailed(message){failure=message} };
  const joke = await run(async () => {throw new Error("Service unavailable")},core);
  assert.equal(joke,null);
  assert.match(failure,/Service unavailable/);
});

test("empty joke results fail without producing a blank GitHub Action output", async () => {
  const output = [];
  const failures = [];
  const core = {
    setOutput(name, value) { output.push([name, value]); },
    setFailed(message) { failures.push(message); }
  };

  const result = await run(async () => "  \n  ", core);

  assert.equal(result, null);
  assert.deepEqual(output, []);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /empty|invalid/i);
});

test("non-string joke results fail instead of publishing an undefined output", async () => {
  const output = [];
  const failures = [];
  const core = {
    setOutput(name, value) { output.push([name, value]); },
    setFailed(message) { failures.push(message); }
  };

  const result = await run(async () => undefined, core);

  assert.equal(result, null);
  assert.deepEqual(output, []);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /empty|invalid/i);
});

test("valid joke text is trimmed before it is published", async () => {
  const output = [];
  const core = {
    setOutput(name, value) { output.push([name, value]); },
    setFailed(message) { throw new Error(message); }
  };

  const result = await run(async () => "  Test joke  ", core);

  assert.equal(result, "Test joke");
  assert.deepEqual(output, [["joke", "Test joke"]]);
});

test("numeric joke results do not become an apparently successful message", async () => {
  const output = [];
  const failures = [];
  const core = {
    setOutput(name, value) { output.push([name, value]); },
    setFailed(message) { failures.push(message); }
  };

  const result = await run(async () => 42, core);

  assert.equal(result, null);
  assert.deepEqual(output, []);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /empty|invalid/i);
});
