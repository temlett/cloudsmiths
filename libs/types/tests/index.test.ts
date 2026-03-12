import { describe, expect, it } from "vitest";

import * as types from "../src/index";

describe("types library exports", () => {
  it("exposes the shared type entrypoints", () => {
    expect(types).toBeTypeOf("object");
  });
});
