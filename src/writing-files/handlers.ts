import { existsSync, mkdirSync, statSync } from "fs";
import { addNewS3Bucket, isProjectInitialized, isS3Initialised, readConfigFile, type Config } from "./tf-files-utils.js";
import {
  appendTemplateToMain,
  fetchTemplate,
  Templates,
  useTemplate,
  useTemplateMultiple,
  writeMultipleTemplatesToFiles,
} from "../utils.js";
import { bootstrapTerraformRemoteState } from "../aws-bootstrap/bootstrap-aws-terraform-remote-state.js";
import { applyTerraformProject } from "../tf-commands.js";
import { parseTfVars } from "../utils.js";
import path from "path";


/**
 * This will initialize the project structure: create a main.tf and variables.tf
 * files in the infra/ folder
 *
 */
export const initProject = (projectCodename: string, region: string) => {
  // const mainFile = fetchTemplate("main.tf.eta");
  // writeFilesSync('infra/', { 'main.tf': mainFile });
  const path = `./infra/`;
  if (!existsSync(path) || !statSync(path).isDirectory()) {
    console.log("Creating infra/ directory");
    mkdirSync(path);
  }
  const params = {
    projectCodename,
    region,
  };
  writeMultipleTemplatesToFiles(
    [
      Templates.MAIN,
      Templates.VARIABLES,
      Templates.PROVIDERS,
      Templates.DEV_ENV_PARAMS,
      Templates.PROD_ENV_PARAMS,
    ],
    params
  );
};

export const createS3Bucket = () => {
  const config: Config = readConfigFile();
  if (!isS3Initialised()) {
    //Check if any bucket exists already, so we dont need to copy the general files again
    writeMultipleTemplatesToFiles(
      [
        Templates.S3_MAIN,
        Templates.S3_VARIABLES,
        Templates.S3_OUTPUTS,
        //Templates.S3_ADD_TO_MAIN,
      ],
      config
    );
    appendTemplateToMain(Templates.S3_ADD_TO_MAIN, config);
  }
  addNewS3Bucket(config.projectCodename, "nuevo");
};


export const executeTerraform = async () => {
  // Read config from vars-dev.tfvars
  const config = readConfigFile();
  const projectCodename = config.projectCodename;
  const region = config.region;
  
  console.log(`Executing project: ${projectCodename} in region: ${region}`);
  const firstRun = true;
  if (firstRun) {
    console.log("Bootstrapping terraform remote state...");
    try{
      await bootstrapTerraformRemoteState(
        projectCodename + "-tfstate-bucket",
        projectCodename + "-tfstate-locks",
        region
      );
    }
    catch (error: any) {
      if (error.Code === 'OperationAborted') {
        console.error('Error: maybe the bucket already exists in another account or region.');
        process.exit(1);
      }
      console.error('Error bootstrapping:', error.message);
      process.exit(1);
    }
    // await applyTerraformProject(template);
  }
};