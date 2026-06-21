import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderIndex } from "../src/ui.js";

describe("renderIndex", () => {
  it("returns HTML with api endpoint", () => {
    const html = renderIndex();
    assert.ok(html.includes("/api/quizzes"));
    assert.ok(html.length > 100);
  });
});
