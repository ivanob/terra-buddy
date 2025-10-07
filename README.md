# terra-buddy
Opinionated CLI to help you scaffold projects with terraform for AWS.

The goal of this tool is to help create/start a project from scratch with a number of decisions about technology and structure, so it is heavily opinionated. Some of the decisions:
- AWS is the cloud provider (maybe extendable in the future to other vendors)
- Terraform is the IaC language
- The terraform state is stored remotely in the provider itself in a S3 bucket (not locally)
