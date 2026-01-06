import { Eta } from "eta";
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

export interface TfVarsConfig {
  region: string;
  account_id: string;
  aws_profile: string;
}

/**
 * These are all the utilities to manipulate templates and write files
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const eta = new Eta({ views: path.join(__dirname, "../templates") });
const outputFolder = "infra/";

export const enum Templates {
  //Templates to initialize project structure
  MAIN = "main/main.tf.eta",
  VARIABLES = "main/variables.tf.eta",
  PROVIDERS = "main/providers.tf.eta",
  DEV_ENV_PARAMS = "main/vars-dev.tfvars.eta",
  PROD_ENV_PARAMS = "main/vars-prod.tfvars.eta",
  //Templates for S3 bucket
  S3_MAIN = "s3/main.tf.eta",
  S3_VARIABLES = "s3/variables.tf.eta",
  S3_OUTPUTS = "s3/outputs.tf.eta",
  S3_ADD_TO_MAIN = "s3/main-add-s3.tf.eta",
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
  templateData: Record<string, any>,
  putInRootFolder: boolean = false // For main files, we dont want to put in infra/main
) => {
  templates.forEach((template) => {
    const content = useTemplate(template, templateData);
    writeTemplateToFile(content, putInRootFolder ? template : removeRootFromPath(template)
    );
  });
}

const removeRootFromPath = (templatePath: string): string => {
  return templatePath.split('/').slice(1).join('/');
}

export const appendTemplateToMain = (templateName: Templates, templateData: Record<string, any>) => {
  const content = useTemplate(templateName, templateData);
  appendToFile("infra/main.tf", content);
};

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

export const parseTfVars = (filePath: string): TfVarsConfig => {
  const content = fs.readFileSync(filePath, 'utf8');
  const config: Partial<TfVarsConfig> = {};
  
  content.split('\n').forEach(line => {
    const match = line.match(/(\w+)\s*=\s*"([^"]+)"/);
    if (match) {
      const [, key, value] = match;
      if (key && value) {
        config[key as keyof TfVarsConfig] = value;
      }
    }
  });
  
  return config as TfVarsConfig;
};