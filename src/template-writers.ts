import { checkIfThereAreAnyS3Buckets } from "./tf-files-utils";
import { useTemplate, useTemplateMultiple } from "./utils";

export const initProject = (projectCodename: string, region: string) => {
  // const mainFile = fetchTemplate("main.tf.eta");
  // writeFilesSync('infra/', { 'main.tf': mainFile });
  useTemplate("main.tf", {
    projectCodename,
    region,
  });
};


export const createS3Bucket = (projectCodename: string, region: string) => {
    if(!checkIfThereAreAnyS3Buckets()){
      //Check if any bucket exists already, so we dont need to copy the general files again
      useTemplateMultiple(["s3/variables.tf", "s3/outputs.tf", "s3/main.tf"], {
        projectCodename,
        region,
      });
    } else{

    }
};