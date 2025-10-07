import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketEncryptionCommand,
  PutBucketVersioningCommand,
  PutPublicAccessBlockCommand,
} from "@aws-sdk/client-s3";
import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  waitUntilTableExists,
} from "@aws-sdk/client-dynamodb";
import { BucketLocationConstraint } from "@aws-sdk/client-s3";

let s3: S3Client | any = undefined;
let dynamodb: DynamoDBClient | any = undefined;

async function ensureS3Bucket(bucketName: string, region: string) {
  console.log(`🔍 Checking S3 bucket for terraform state: ${bucketName}`);

  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
    console.log("✅ Bucket for terraform state already exists");
  } catch (err: any) {
    if (err?.$metadata?.httpStatusCode === 404 || err.name === "NotFound") {
      console.log("🪣 Bucket not found, creating...");
      const createCmd = new CreateBucketCommand({
        Bucket: bucketName,
        ...(region !== "us-east-1" && {
          CreateBucketConfiguration: {
            LocationConstraint: region as BucketLocationConstraint,
          },
        }),
      });
      await s3.send(createCmd);
      console.log("✅ Bucket for terraform state created");
    } else {
      throw err;
    }
  }

  console.log("🔒 Applying public access block");
  await s3.send(
    new PutPublicAccessBlockCommand({
      Bucket: bucketName,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        IgnorePublicAcls: true,
        BlockPublicPolicy: true,
        RestrictPublicBuckets: true,
      },
    })
  );

  console.log("🔐 Enabling default encryption (AES256)");
  await s3.send(
    new PutBucketEncryptionCommand({
      Bucket: bucketName,
      ServerSideEncryptionConfiguration: {
        Rules: [
          {
            ApplyServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" },
          },
        ],
      },
    })
  );

  console.log("🧾 Enabling versioning");
  await s3.send(
    new PutBucketVersioningCommand({
      Bucket: bucketName,
      VersioningConfiguration: { Status: "Enabled" },
    })
  );
}

async function ensureDynamoDBTable(ddbTableName: string) {
  console.log(`🔍 Checking DynamoDB table: ${ddbTableName}`);
  try {
    await dynamodb.send(new DescribeTableCommand({ TableName: ddbTableName }));
    console.log("✅ Table already exists");
  } catch (err: any) {
    if (err.name === "ResourceNotFoundException") {
      console.log("📦 Creating DynamoDB table for terraform state...");
      await dynamodb.send(
        new CreateTableCommand({
          TableName: ddbTableName,
          BillingMode: "PAY_PER_REQUEST",
          AttributeDefinitions: [
            { AttributeName: "LockID", AttributeType: "S" },
          ],
          KeySchema: [{ AttributeName: "LockID", KeyType: "HASH" }],
        })
      );
      console.log(
        "⏳ Waiting for table for terraform state to become ACTIVE..."
      );
      await waitUntilTableExists(
        { client: dynamodb, maxWaitTime: 60 },
        { TableName: ddbTableName }
      );
      console.log("✅ Table created and ready");
    } else {
      throw err;
    }
  }
}

export const bootstrapTerraformRemoteState = async (
  bucketName: string,
  ddbTableName: string,
  region: string
) => {
  s3 = new S3Client({ region: region });
  dynamodb = new DynamoDBClient({ region: region });
  await ensureS3Bucket(bucketName, region);
  await ensureDynamoDBTable(ddbTableName);

  console.log(`
✅ Terraform remote state backend is ready. Use this block:

terraform {
  backend "s3" {
    bucket         = "${bucketName}"
    key            = "staging/terraform.tfstate"
    region         = "${region}"
    encrypt        = true
    dynamodb_table = "${ddbTableName}"
  }
}

Then run:
  terraform init -reconfigure
`);
};
