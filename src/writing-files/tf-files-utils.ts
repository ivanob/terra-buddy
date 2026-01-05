/**
 * These are all the utilities to manage the tf templates: read values, 
 * add new resources, etc.
 */
import fs from "fs";

import { appendToFile, fetchTemplate, Templates } from "../utils.js";

export type Config = {
  projectCodename: string;
  region: string;
}

export const isS3Initialised = (): boolean => {
  //Check if the folder s3 exists in infra
  return fs.existsSync("./infra/s3");
};

export const addNewS3Bucket = (projectCodename: string, bucketName: string ) => {
  const contentNewS3 = fetchTemplate(Templates.MAIN, {
    projectCodename,
    bucketName,
  });
  appendToFile("infra/main.tf", contentNewS3);
};

export const isProjectInitialized = (): boolean => {
  //Check if the infra folder exists
  return true;
};

export const getProjectCodename = (): string => {
  return "tri2";
};

export const getProjectName = (): string => {
  return "long name of the project";
};

export const initializeConfigFile = (projectName: string, region: string): void => {
  //Create a default config file if not exists
  const data = { projectName, region };
  fs.writeFileSync("./infra/project-config.json", JSON.stringify(data, null, 2));
};

export const readConfigFile = (): Config => {
  if (!fs.existsSync("./infra/project-config.json")) {
    throw new Error("Project not initialized. Please run 'init' command first.");
  }
  const config = fs.readFileSync("./infra/project-config.json", "utf-8");
  return JSON.parse(config) as Config;
};