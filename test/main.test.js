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
