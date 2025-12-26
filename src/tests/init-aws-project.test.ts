import { describe, it, expect } from "vitest";
import { useTemplate, Templates } from "../utils";
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe("Test on aws templates", () => {
  it("should initialize aws project", async () => {
    const expectedOutput = readFileSync(resolve(import.meta.dirname, 'outputs/output1.txt'), 'utf8');
    expect(useTemplate(Templates.MAIN, { region: "fake-region-1", projectCodename: 'abc123' })).toBe(expectedOutput.trim());
  });
});
