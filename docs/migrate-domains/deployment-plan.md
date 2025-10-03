# AWS Deployment Plan: shouldable.ai

**Objective:** Deploy the LAPSloop application to AWS, keeping the domain registered at GoDaddy but using AWS Route 53 as the authoritative DNS service. This plan serves as the single source of truth for the project.

**Key Roles:**
*   **Stephane:** Manages all resources and permissions within the AWS Console.
*   **Gerard:** Manages the GoDaddy domain, develops the application and all CDK infrastructure code, and runs deployments from the CLI.

---

## Timeline Summary

| Phase   | Who             | Key Milestone                                          |
| ------- | --------------- | ------------------------------------------------------ |
| Phase 1 | Stephane/Gerard | Delegate DNS from GoDaddy to AWS Route 53.             |
| Phase 2 | Stephane/Gerard | Set up local AWS access and develop CDK code.          |
| Phase 3 | Stephane        | Review and approve CDK code.                           |
| Phase 4 | Gerard          | Deploy infrastructure via CDK CLI.                     |
| Phase 5 | Stephane        | Create DNS records in Route 53 to point to CloudFront. |
| Phase 6 | Both            | Test and validate the deployment.                      |
| Phase 7 | Stephane/Gerard | Configure CI/CD pipeline.                              |

---

## Phase 1: Initial AWS Setup & DNS Delegation

**Goal:** Perform the initial one-time setup of the AWS Hosted Zone and developer access. Then, delegate DNS control from GoDaddy to AWS.

1.  **Stephane: Verify Hosted Zone & Provide Access**
    *   [x] **Note:** The hosted zone for `shouldable.ai` has already been created with ID: `Z07945003DLIAZQPS5184`
    *   [x] In the AWS Console, navigate to **Route 53 → Hosted zones** and open the `shouldable.ai` zone.
    *   [x] From the hosted zone details, copy the four **NS (Name Server) records**.
    *   [x] In **IAM**, create a new IAM user for Gerard (e.g., `gerard-cdk-deploy`).
    *   [x] Attach appropriate permissions for CDK deployment (e.g., `PowerUserAccess` or a custom policy).
    *   [x] Generate **Access Keys** for this IAM user (Access Key ID and Secret Access Key).
    *   [x] **Notify Gerard:** Securely provide the Access Key ID, Secret Access Key, AWS Account ID, AWS Region (`eu-west-1`), the Hosted Zone ID (`Z07945003DLIAZQPS5184`), and the four NS records. Use a secure channel (e.g., 1Password, encrypted message).
    *   [x] **Access keys provided and stored securely in 1Password** (removed from this document for security)


2.  **Gerard: Configure CLI & Update GoDaddy**
    *   [x] Using the access keys from Stephane, configure the AWS CLI with a named profile:
        ```bash
        aws configure --profile lapsloop-dev
        # Enter:
        # - AWS Access Key ID: [provided by Stephane]
        # - AWS Secret Access Key: [provided by Stephane]
        # - Default region: eu-west-1
        # - Default output format: json
        ```
    *   [x] Verify AWS access with the new profile: `aws sts get-caller-identity --profile lapsloop-dev`
        **Account ID: 102438122711**
    *   [x] **Security:** Store the access keys securely (e.g., in 1Password). Never commit them to git.
    *   [x] In GoDaddy, navigate to the DNS settings for `shouldable.ai` and replace the existing nameservers with the four AWS NS records provided by Stephane.
    *   [x] **Notify Stephane:** "GoDaddy nameservers have been updated."

---

## Phase 2: Environment Bootstrap & Infrastructure Development

1.  **Gerard: Prepare CDK Environment & Bootstrap**
    *   [x] Verify AWS access: `aws sts get-caller-identity --profile lapsloop-dev`. Note the `AccountId` from the output - you'll need it for the bootstrap commands.
        **Account ID: 102438122711**
    *   [x] Create the `infrastructure/` workspace:
        ```bash
        mkdir infrastructure
        cd infrastructure
        ```
    *   [x] Initialize a new CDK project:
        ```bash
        npx cdk init app --language typescript
        ```
        This creates the necessary `cdk.json`, `package.json`, and project structure with `aws-cdk-lib` already installed.
    *   [x] **Note:** CDK v2 includes all AWS construct libraries in `aws-cdk-lib`. Import AWS services like:
        ```typescript
        import * as lambda from 'aws-cdk-lib/aws-lambda';
        import * as rds from 'aws-cdk-lib/aws-rds';
        import * as ec2 from 'aws-cdk-lib/aws-ec2';
        ```
        No additional package installations are needed for standard AWS resources.
    *   [x] **Bootstrap CDK for both required regions.** Replace `ACCOUNT_ID` with the actual Account ID from step 1. This is a one-time setup per region.
        ```bash
        npx cdk bootstrap aws://102438122711/eu-west-1 --profile lapsloop-dev
        npx cdk bootstrap aws://102438122711/us-east-1 --profile lapsloop-dev
        ```
    *   [x] **Return to repo root:**
        ```bash
        cd ..
        ```
        The remaining steps assume you're at the repository root. Deployment commands in Phase 4 will explicitly `cd infrastructure` when needed.

1.  **Gerard: Develop CDK Stacks**
    *   [ ] Develop the CDK stacks (`certificate-stack.ts`, `web-stack.ts`, etc.).
    *   [ ] **Crucially:** In `certificate-stack.ts`, do **not** create a new hosted zone. Instead, use `HostedZone.fromHostedZoneAttributes` or `HostedZone.fromLookup` to import the existing zone using the Hosted Zone ID: `Z07945003DLIAZQPS5184`. This makes the CDK aware of the manually-created zone without trying to recreate it.
        ```typescript
        // Example:
        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
          hostedZoneId: 'Z07945003DLIAZQPS5184',
          zoneName: 'shouldable.ai',
        });
        ```
    *   [ ] In `prisma/schema.prisma`, ensure `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` is set.
    *   [ ] In `next.config.js`, ensure `output: "standalone"` is set.
    *   [ ] **Configure DATABASE_URL:** In the CDK stack, set the Lambda `DATABASE_URL` environment variable in the format: `postgresql://username@proxy-endpoint:5432/database` (no password - IAM auth will be used).
    *   [ ] **Implement IAM Token Generation:** In the Lambda handler code, implement runtime IAM token generation using `@aws-sdk/rds-signer` before initializing Prisma. The token must be generated fresh for each database connection.
    *   [ ] **Certificate ARN Export:** Ensure `certificate-stack.ts` exports the Certificate ARN as a CloudFormation output for cross-region import by the main stack.
    *   [ ] **Verify DNS Validation:** Confirm that CDK is configured to automatically create DNS validation records in Route 53 for ACM certificate validation (this should happen automatically when using `HostedZone.fromLookup`).

2.  **Both: Monitor DNS Propagation**
    *   [x] Periodically check that the nameserver change is live: `dig NS shouldable.ai`.
    *   [x] Once the command returns the AWS nameservers, the ACM certificate in the `certificate-stack` can be successfully validated.
        **Confirmed:** All four AWS nameservers are active (ns-1289.awsdns-33.org, ns-1700.awsdns-20.co.uk, ns-152.awsdns-19.com, ns-814.awsdns-37.net)

---

## Phase 3: Review Infrastructure Code

1.  **Gerard: Submit CDK Code for Review**
    *   [ ] Push the CDK code to a feature branch and create a Pull Request.
    *   [ ] **Notify Stephane:** "The CDK code for LAPSloop is ready for your review."

2.  **Stephane: Review and Approve Infrastructure**
    *   [ ] Review the CDK code in Gerard's PR.
    *   [ ] **VPC & Networking:** Confirm the VPC, subnets, and security groups are configured correctly.
    *   [ ] **Database:** Verify the Aurora Serverless and RDS Proxy configurations.
    *   [ ] **IAM Roles:** Audit the Lambda execution role and its `rds-db:connect` permissions.
    *   [ ] **Secrets:** Ensure all secrets are handled via AWS Secrets Manager.
    *   [ ] Approve the PR.
    *   [ ] **Notify Gerard:** "CDK stacks reviewed and approved. You are clear to deploy."

---

## Phase 3.5: Pre-Deployment Verification

**Goal:** Verify all prerequisites are in place before deployment to avoid mid-deployment failures.

1.  **Both: Verify Critical Prerequisites**
    *   [ ] **DNS Propagation Complete:** Run `dig NS shouldable.ai` and confirm all four AWS nameservers are returned. If not, deployment will fail during certificate validation.
    *   [ ] **IAM Token Generation Implemented:** Gerard verifies that the Lambda handler code includes runtime IAM token generation using `@aws-sdk/rds-signer` before Prisma initialization.
    *   [ ] **DATABASE_URL Configured Correctly:** Gerard verifies the CDK code sets the Lambda `DATABASE_URL` environment variable without a password (format: `postgresql://user@host:5432/db`).
    *   [ ] **Certificate ARN Cross-Region Reference:** Gerard verifies that:
        - `certificate-stack.ts` exports the Certificate ARN as a CloudFormation output
        - `web-stack.ts` imports this ARN from the us-east-1 stack (e.g., using `CfnOutput` and `Fn.importValue` or SSM parameters)
    *   [ ] **DNS Validation Configuration:** Gerard verifies CDK will automatically create DNS validation records in Route 53 for the certificate.

2.  **Gerard: Final Code Review Checklist**
    *   [ ] Security groups are configured with proper ingress/egress rules (Lambda → RDS Proxy → Aurora)
    *   [ ] VPC has NAT Gateway or VPC endpoints for external API calls (OpenAI) and AWS services (Secrets Manager)
    *   [ ] RDS Proxy is configured with IAM authentication enabled
    *   [ ] Lambda execution role has `rds-db:connect` permission for the RDS Proxy

**Do not proceed to Phase 4 until all checks pass.**

---

## Phase 4: Deploy Infrastructure via CDK

1.  **Gerard: Deploy the Stacks**
    *   [ ] Ensure the `lapsloop-dev` AWS profile is configured correctly.
    *   [ ] **Pre-flight Check:** Verify DNS propagation one final time: `dig NS shouldable.ai` must return AWS nameservers.
    *   [ ] Deploy the certificate stack first. This **must** be deployed to `us-east-1`.
        ```bash
        cd infrastructure
        npx cdk deploy LapsloopCertificateStack --region us-east-1 --profile lapsloop-dev
        ```
    *   [ ] **Wait for Certificate Validation:** CDK will automatically create DNS validation CNAME records in Route 53. Monitor the deployment until the certificate status shows `ISSUED`. This typically takes 5-10 minutes but can take up to 30 minutes.
    *   [ ] **Verify Certificate ARN:** From the CDK output, note the Certificate ARN (e.g., `arn:aws:acm:us-east-1:ACCOUNT:certificate/abc-123`). This will be automatically imported by the main stack.
    *   [ ] Deploy the main application stack to `eu-west-1`.
        ```bash
        npx cdk deploy LapsloopDesignStack --region eu-west-1 --profile lapsloop-dev
        ```
    *   [ ] From the CDK output, note the **CloudFront URL** (e.g., `d111111abcdef8.cloudfront.net`) and the **RDS Proxy Endpoint**.
    *   [ ] **Notify Stephane:** "Design environment deployed. The CloudFront URL is: [URL] and the RDS Proxy endpoint is: [ENDPOINT]."

2.  **Gerard: Migrate Database Schema**
    *   [ ] Run the database migration against the new RDS Proxy endpoint using the dedicated wrapper script. This script handles IAM token generation automatically.
        ```bash
        AWS_PROFILE=lapsloop-dev npm run migrate:aws
        ```
    *   [ ] **Notify Stephane:** "Database schema has been pushed to Aurora."

3.  **Stephane: Verify Deployment in AWS Console**
    *   [ ] Check CloudFormation to see the `LapsloopDesignStack` in a `CREATE_COMPLETE` state.
    *   [ ] Verify the Lambda, Aurora cluster, and other resources were created.
    *   [ ] Ask Gerard to test connectivity to confirm IAM authentication is working correctly.
    *   [ ] **Note:** Master password rotation will be performed after full validation in Phase 6.

---

## Phase 5: DNS Cut-Over and Final Testing

1.  **Stephane: Create DNS Record in Route 53**
    *   [ ] In the AWS Console, navigate to the `shouldable.ai` hosted zone.
    *   [ ] Create a `CNAME` record for `design.shouldable.ai`.
    *   [ ] Point it to the CloudFront distribution URL provided by Gerard.
    *   [ ] **Notify Gerard:** "The `design` subdomain now points to CloudFront."

2.  **Gerard: Final App Update and Testing**
    *   [ ] Update the `NEXT_PUBLIC_APP_URL` in the code to `https://design.shouldable.ai`.
    *   [ ] Re-run `npx cdk deploy LapsloopDesignStack --region eu-west-1 --profile lapsloop-dev` to apply the environment variable change.
    *   [ ] Test the application thoroughly at `https://design.shouldable.ai`.

---

## Phase 6: Post-Deployment Validation

*   **Both:**
    *   [ ] Run end-to-end tests on `https://design.shouldable.ai`.
    *   [ ] Monitor CloudWatch logs and metrics for any errors or performance issues.
*   **Gerard:**
    *   [ ] Document the final URLs and any deployment notes.
*   **Stephane:**
    *   [ ] Set up billing and performance alarms in CloudWatch for the new resources.
    *   [ ] **Rotate Database Master Password:** Once all validation is complete and IAM authentication is confirmed working, rotate the master password in Secrets Manager. Note that this does not affect IAM authentication, which is used by the Lambda functions.

---

## Phase 7: CI/CD Setup

1.  **Stephane: Create OIDC Role in AWS**
    *   [ ] In IAM, create the OIDC identity provider for GitHub.
    *   [ ] Create the `GitHubActionsDeployRole` with a trust policy scoped to the `laps-loop` repository.
    *   [ ] Attach the necessary permissions for CDK deployment.
    *   [ ] **Notify Gerard:** "The IAM Role for GitHub Actions is `arn:aws:iam::ACCOUNT_ID:role/GitHubActionsDeployRole`."

2.  **Gerard: Configure GitHub Actions Workflow**
    *   [ ] Create the `.github/workflows/design-deploy.yml` file.
    *   [ ] Configure the workflow to use OIDC with the Role ARN provided by Stephane.
    *   [ ] Add secrets to GitHub for any values needed during the build (e.g., `DATABASE_URL_DESIGN` which contains the proxy endpoint without a password).
    *   [ ] Test the workflow by pushing a commit to the `design` branch.

---
## Appendix A: Critical Considerations

### Database Connectivity

#### VPC Architecture
Lambda functions must run inside the same VPC and private subnets as the RDS Proxy. Security groups must be chained correctly:

**Security Group Rules:**
1. **Lambda Security Group** (e.g., `LambdaSG`)
   - Egress: Allow TCP 5432 to RDS Proxy SG
   - Egress: Allow TCP 443 to 0.0.0.0/0 (for OpenAI API and AWS services)

2. **RDS Proxy Security Group** (e.g., `RDSProxySG`)
   - Ingress: Allow TCP 5432 from Lambda SG
   - Egress: Allow TCP 5432 to Aurora SG

3. **Aurora Security Group** (e.g., `AuroraSG`)
   - Ingress: Allow TCP 5432 from RDS Proxy SG

**Internet Access:** A NAT Gateway is required in a public subnet to allow Lambda functions internet egress for the OpenAI API. Alternatively, use VPC endpoints for AWS services to reduce NAT Gateway costs:
- VPC Endpoint for Secrets Manager (com.amazonaws.REGION.secretsmanager)
- VPC Endpoint for S3 (if storing assets)

**Important:** Lambda functions in private subnets require either NAT Gateway or VPC endpoints to access AWS services and external APIs.

#### IAM Authentication
*   The Lambda execution role requires `rds-db:connect` permissions for the RDS Proxy resource ARN.
*   The `DATABASE_URL` in the Lambda environment must NOT contain a password; the application code must generate a temporary token at runtime using `@aws-sdk/rds-signer`.
*   Example IAM policy:
    ```json
    {
      "Effect": "Allow",
      "Action": "rds-db:connect",
      "Resource": "arn:aws:rds-db:REGION:ACCOUNT:dbuser:PROXY-ID/DATABASE_USER"
    }
    ```

#### Connection Pooling
Prisma should target the RDS Proxy endpoint. The proxy handles connection pooling automatically. See additional guidance in "Prisma in a Lambda Environment" section below.

### Prisma in a Lambda Environment
*   **Build Configuration:** The deployment package must include `node_modules/.prisma` and `@prisma/client`. The Prisma schema generator must include `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`.
*   **Migrations:** Migrations should be stored in the repository and run via a script that can handle IAM authentication (e.g., `npm run migrate:aws`).
*   **Connection Pooling in Lambda:**
    - RDS Proxy provides connection pooling, so Prisma's built-in pooling is less critical
    - However, Lambda cold starts require careful Prisma client initialization
    - Best practices:
      1. Initialize Prisma client **outside** the Lambda handler (reused across invocations)
      2. Use `connection_limit = 1` in the DATABASE_URL for Lambda (RDS Proxy handles actual pooling)
      3. Generate IAM token **inside** the handler (tokens expire after 15 minutes)
      4. Consider using `PrismaClient.$connect()` explicitly after token refresh
    - Example pattern:
      ```typescript
      // Global scope - reused across invocations
      const prisma = new PrismaClient({
        datasources: {
          db: { url: process.env.DATABASE_URL + '?connection_limit=1' }
        }
      });

      // Handler - regenerate token on each invocation
      export async function handler(event: any) {
        const token = await generateIAMToken();
        // Update connection with fresh token
        await prisma.$connect();
        // ... use prisma
      }
      ```

---

## Appendix B: Rollback Plan

*   **Application:** The `DATABASE_URL` can be quickly reverted to point back to the original Railway database if major issues occur with the Aurora cluster.
*   **Infrastructure:** The entire AWS infrastructure can be destroyed via the CDK: `npx cdk destroy --all`.
*   **DNS:** The nameserver records at GoDaddy can be pointed back to the GoDaddy default nameservers to move DNS control away from AWS.

---

## Appendix C: Future Multi-Environment Strategy

This document details the initial deployment of a single 'design' environment. A future phase of work will involve extending this architecture to support distinct 'development' and 'production' environments, which will be aligned with dev and prod branches in the Git repository, respectively. The CDK infrastructure will be parameterized to support this multi-environment pattern.

---

## Appendix D: Database Migration Script Guidance

To ensure database migrations are run securely against the AWS database without hardcoding credentials, a wrapper script is required. This script handles the generation of a temporary IAM authentication token.

**1. `package.json` Script:**
Add the following script to the root `package.json`:
```json
"scripts": {
  // ... other scripts
  "migrate:aws": "tsx scripts/migrate-with-iam-auth.ts"
}
```

**2. Script Implementation (`scripts/migrate-with-iam-auth.ts`):**
This TypeScript file (run with `tsx`) should contain logic to:
1.  Read the database configuration (hostname, port, user) from the `DATABASE_URL` environment variable.
2.  Use the `@aws-sdk/rds-signer` package to generate a new IAM authentication token.
3.  Construct a new database URL that includes the temporary token as the password.
4.  Execute the `prisma db push` or `prisma migrate deploy` command as a child process, providing the new URL as the `DATABASE_URL` for that process.

**3. Usage:**
*   **CI/CD:** The workflow will call `npm run migrate:aws` directly. The environment will have AWS credentials via OIDC.
*   **Local Development:** A developer runs the script using the configured named profile. The script will automatically use the credentials from this profile to generate the IAM token.
    ```bash
    AWS_PROFILE=lapsloop-dev npm run migrate:aws
    ```
