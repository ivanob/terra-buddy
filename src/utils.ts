import { Eta } from "eta";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

/**
 * These are all the utilities to manipulate templates and write files
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const eta = new Eta({ views: path.join(__dirname, "../templates") });
const outputFolder = "infra/";

export const enum Templates {
  MAIN = "main/main.tf.eta",
  VARIABLES = "main/variables.tf.eta",
  PROVIDERS = "main/providers.tf.eta",
  DEV_ENV_PARAMS = "main/vars-dev.tfvars.eta",
  PROD_ENV_PARAMS = "main/vars-prod.tfvars.eta",
}

export const fetchTemplate = (
  templateName: Templates,
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
  templateName: Templates,
  templateData: Record<string, any>
): string => {
  const contentTemplate = fetchTemplate(templateName, templateData);
  return contentTemplate;
};

export const writeTemplateToFile = (
  templateContent: string,
  filename: string
) => {
  writeFilesSync(outputFolder, filename.slice(0, -4), templateContent);
};

export const writeMultipleTemplatesToFiles = (
  templates: Templates[],
  templateData: Record<string, any>
) => {
  templates.forEach((template) => {
    const content = useTemplate(template, templateData);
    writeTemplateToFile(content, template);
  });
}

export const useTemplateMultiple = (
  templates: Templates[],
  templateData: Record<string, any>
) => {
  return templates.forEach((templateName) => {
    useTemplate(templateName, templateData);
  });
};

export const appendToFile = (filePath: string, contentToAdd: string) => {
  // Check if file exists
  if (fs.existsSync(filePath)) {
    const existingContent = fs.readFileSync(filePath, 'utf8');
    // Combine existing + new content
    const updatedContent = existingContent + '\n' + contentToAdd;
    fs.writeFileSync(filePath, updatedContent);
  } else {
    fs.writeFileSync(filePath, contentToAdd);
  }
};