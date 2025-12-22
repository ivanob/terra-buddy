/**
 * These are all the utilities to manage the tf templates: read values, 
 * add new resources, etc.
 */

import { appendToFile, fetchTemplate } from "../utils";

export const isS3Initialised = (): boolean => {
  //Check if the folder s3 exists in infra
  return false;
};

export const addNewS3Bucket = (projectCodename: string, bucketName: string ) => {
  const contentNewS3 = fetchTemplate("main-add-s3.tf.eta", {
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
