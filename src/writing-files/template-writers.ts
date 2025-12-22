import { existsSync, mkdirSync, statSync } from "fs";
import { addNewS3Bucket, isS3Initialised } from "./tf-files-utils";
import { fetchTemplate, useTemplate, useTemplateMultiple } from "../utils";

export const initProject = (projectCodename: string, region: string) => {
  // const mainFile = fetchTemplate("main.tf.eta");
  // writeFilesSync('infra/', { 'main.tf': mainFile });
  const path = `./infra/`;
  if (!existsSync(path) || !statSync(path).isDirectory()) {
    console.log("📁 Creating infra/ directory")
    mkdirSync(path);
  }
  useTemplate("main.tf", {
    projectCodename,
    region,
  });
};

export const createS3Bucket = (projectCodename: string, region: string) => {
  if (!isS3Initialised()) {
    //Check if any bucket exists already, so we dont need to copy the general files again
    useTemplateMultiple(["s3/variables.tf", "s3/outputs.tf", "s3/main.tf"], {
      projectCodename,
      region,
    });
  }
  addNewS3Bucket(projectCodename, "myBucket" );
};
