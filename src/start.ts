import { select } from "@inquirer/prompts";
import { Command } from "commander";
import { initProject, initTerraformProject } from "./commands";
import { bootstrapTerraformRemoteState } from "./aws-bootstrap/bootstrap-aws-terraform-remote-state";

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
        { name: "AWS serverless + Typescript", value: "aws-ts-serverless" },
        // { name: "GCP compute", value: "gcp-compute" },
        // { name: "Azure web app", value: "azure-webapp" }
      ],
    })
    console.log(`Creating project with template: ${template}`);
    console.log(`Creating project with code name: ${code_name}`);
    //await initTerraformProject(template)
    await bootstrapTerraformRemoteState(code_name + "-tfstate-bucket", code_name + "-tfstate-locks", region);
    initProject(code_name, region);
    await initTerraformProject(template);
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
    console.log(`Creating project: ${project} with template: ${options.template}`);
  });

program.parse(process.argv);