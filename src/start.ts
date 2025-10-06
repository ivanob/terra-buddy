import { select } from "@inquirer/prompts";
import { Command } from "commander";
import { execa } from "execa";
import { initProject } from "./commands";

const program = new Command();

program
  .name("terrabuddy")
  .description("Terraform code generator and helper")
  .version("1.0.0");

// typed options and arguments
program
  .command("init")
  .argument("<code_name>", "project code name")
  .action(async (code_name: string) => {
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
initProject();
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

const initTerraformProject = async (template: string) => {
  // Logic to initialize a Terraform project based on the selected template
  console.log(`Initializing Terraform project with template: ${template}`);
  execa("mkdir", ["infra"], { stdio: "inherit" });
  execa("cd", ["infra"], { stdio: "inherit" });
  // execa("curl -o main.tf https://raw.githubusercontent.com/your-repo/terraform-templates/main/" + template + "/main.tf", { stdio: "inherit" });

  await execa("terraform", ["init"], { stdio: "inherit" });
}