import { Eta } from "eta";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const eta = new Eta({ views: path.join(__dirname, "../templates") });
const outputFolder = "infra/";

const fetchTemplate = (
  templateName: string,
  templateData: Record<string, any>
) => {
  const output = eta.render(`./${templateName}`, templateData);
  return output;
};

const writeFilesSync = (dir: string, filename: string, content: string) => {
  const pathToFile = filename.includes('/') ? path.dirname(filename) : '';
  if (pathToFile) {
    // Create directory if it doesn't exist
    fs.mkdirSync(path.join(dir, pathToFile), { recursive: true });
  }
  fs.writeFileSync(path.join(dir, filename), content);
};

export const useTemplate = (
  templateName: string,
  templateData: Record<string, any>
) => {
  const contentTemplate = fetchTemplate(`${templateName}.eta`, templateData);
  writeFilesSync(outputFolder, templateName, contentTemplate);
};

export const useTemplateMultiple = (
  templates: string[],
  templateData: Record<string, any>
) => {
  templates.forEach((templateName) => {
    useTemplate(templateName, templateData);
  });
};
