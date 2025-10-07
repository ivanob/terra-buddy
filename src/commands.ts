import { execa } from "execa";
import { useTemplate } from "./utils";

export const initProject = (projectCodename: string, region: string) => {
  // const mainFile = fetchTemplate("main.tf.eta");
  // writeFilesSync('infra/', { 'main.tf': mainFile });
  useTemplate("main.tf", "infra/", {
    project_codename: projectCodename,
    region,
  });
};

export const initTerraformProject = async (template: string) => {
  // Logic to initialize a Terraform project based on the selected template
  console.log(`Initializing Terraform project with template: ${template}`);

  await execa("rm", ["-rf", "infra/.terraform"]);
  await execa("terraform", ["init"], { cwd: "infra", stdio: "inherit" });
  await execa("terraform", ["apply", "-auto-approve"], { cwd: "infra", stdio: "inherit" });
};
