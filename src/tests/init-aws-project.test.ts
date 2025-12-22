import { describe, it, expect } from "vitest";
import { useTemplate, Templates } from "../utils";
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Test on aws templates", () => {
  it("should should initialize aws project", async () => {
    const expectedOutput = readFileSync(join(__dirname, 'outputs/output1.txt'), 'utf8');
    expect(useTemplate(Templates.MAIN, { region: "fake-region-1" })).toBe(expectedOutput.trim());
  });
});
