#!/usr/bin/env node
import { select } from "@inquirer/prompts";
import { Command } from "commander";
import {
  createS3Bucket,
  initProject,
} from "./writing-files/template-writers.js";
import { bootstrapTerraformRemoteState } from "./aws-bootstrap/bootstrap-aws-terraform-remote-state.js";
import { applyTerraformProject } from "./tf-commands.js";
import { parseTfVars } from "./utils.js";
import path from "path";

const program = new Command();

program
  .name("terrabuddy")
  .description("Terraform code generator and helper")
  .version("1.0.0");

// typed options and arguments
program
  .command("init")
  .argument("<code_name>", "project code name (e.g., myapp, tks, etc.)")
  .argument("<region>", "AWS region")
  .action(async (code_name: string, region: string) => {
    const template = await select({
      message: "Select a template:",
      choices: [
        { name: "AWS", value: "aws-ts-serverless" },
        // { name: "GCP compute", value: "gcp-compute" },
        // { name: "Azure web app", value: "azure-webapp" }
      ],
    });
    console.log(`Creating project with template: ${template}`);
    console.log(`Creating project with code name: ${code_name}`);
    initProject(code_name, region);
  });

// program
//   .command("init")
//   .argument("<project>", "project name")
//   .option("-t, --template <name>", "template name", "aws-serverless")
//   .action((project: string, options: { template: string }) => {
//     console.log(`Creating project: ${project} with template: ${options.template}`);
//   });

program
  .command("gateway")
  .argument("<project>", "project name")
  .option("-t, --template <name>", "template name", "aws-serverless")
  .action((project: string, options: { template: string }) => {
    console.log(
      `Creating project: ${project} with template: ${options.template}`
    );
  });

program
  .command("s3")
  .argument("<code_name>", "project code name (e.g., myapp, tks, etc.)")
  .argument("<region>", "AWS region")
  .action((code_name: string, region: string) => {
    console.log(
      `Creating S3 bucket for project: ${code_name} in region: ${region}`
    );
    createS3Bucket(code_name, region);
  });

program.command("execute").action(async () => {
  // Read config from vars-dev.tfvars
  const tfVarsPath = path.join(process.cwd(), 'infra/main/vars-dev.tfvars');
  const config = parseTfVars(tfVarsPath);
  const code_name = 'bbb';
  const region = config.region;
  
  console.log(`Executing project: ${code_name} in region: ${region}`);
  const firstRun = true;
  if (firstRun) {
    console.log("Bootstrapping terraform remote state...");
    try{
      await bootstrapTerraformRemoteState(
        code_name + "-tfstate-bucket",
        code_name + "-tfstate-locks",
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
});

program.parse(process.argv);
