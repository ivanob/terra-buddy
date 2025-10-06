import { Eta } from "eta"
import path from "path";
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const eta = new Eta({ views: path.join(__dirname, "../templates") });

export const fetchTemplate = (templateName: string) => {
  const output = eta.render(`./${templateName}`, {
    // terraform_version: ">= 1.6.0, < 2.0.0",
    // aws_region: "eu-west-1",
    // bucket_name: "myapp-logs",
    project_codename: "myapp",
  });

  //   fs.writeFileSync("main.tf", output);
  return output;
};


export const writeFilesSync = (dir: string, files: { [filename: string]: string }) => {
    for (const [filename, content] of Object.entries(files)) {
        fs.writeFileSync(path.join(dir, filename), content);
    }
}