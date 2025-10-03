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

1.  **Stephane: Create Hosted Zone & Provide Access**
    *   [ ] In the AWS Console, navigate to **Route 53 → Hosted zones → Create hosted zone**.
    *   [ ] Enter the domain name: `shouldable.ai`, and create it as a **Public hosted zone**.
    *   [ ] From the new zone, copy the **Hosted zone ID** and the four **NS (Name Server) records**.
    *   [ ] In **IAM Identity Center (SSO)**, create a user for Gerard with permissions for CDK deployment (e.g., `PowerUserAccess`).
    *   [ ] **Notify Gerard:** Securely provide the SSO User Portal URL, AWS Region (`eu-west-1`), the Hosted Zone ID, and the four NS records.

2.  **Gerard: Configure CLI & Update GoDaddy**
    *   [ ] Using the details from Stephane, configure the AWS CLI: `aws configure sso`.
    *   [ ] Log in to get temporary credentials: `aws sso login`.
    *   [ ] In GoDaddy, navigate to the DNS settings for `shouldable.ai` and replace the existing nameservers with the four AWS NS records provided by Stephane.
    *   [ ] **Notify Stephane:** "GoDaddy nameservers have been updated."

---

## Phase 2: Environment Bootstrap & Infrastructure Development

1.  **Gerard: Bootstrap CDK & Prepare Environment**
    *   [ ] Verify AWS access: `aws sts get-caller-identity`. Note the `AccountId`.
    *   [ ] **Bootstrap CDK for both required regions.** This is a one-time setup per region.
        ```bash
        npx cdk bootstrap aws://ACCOUNT_ID/eu-west-1
        npx cdk bootstrap aws://ACCOUNT_ID/us-east-1
        ```
    *   [ ] Create the `infrastructure/` workspace and `package.json` with CDK dependencies.

2.  **Gerard: Develop CDK Stacks**
    *   [ ] Develop the CDK stacks (`certificate-stack.ts`, `web-stack.ts`, etc.).
    *   [ ] **Crucially:** In `certificate-stack.ts`, do **not** create a new hosted zone. Instead, use `HostedZone.fromHostedZoneAttributes` or `HostedZone.fromLookup` to import the existing zone using the ID provided by Stephane. This makes the CDK aware of the manually-created zone without trying to recreate it.
    *   [ ] In `prisma/schema.prisma`, ensure `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]` is set.
    *   [ ] In `next.config.js`, ensure `output: "standalone"` is set.

3.  **Both: Monitor DNS Propagation**
    *   [ ] Periodically check that the nameserver change is live: `dig NS shouldable.ai`.
    *   [ ] Once the command returns the AWS nameservers, the ACM certificate in the `certificate-stack` can be successfully validated.

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

## Phase 4: Deploy Infrastructure via CDK

1.  **Gerard: Deploy the Stacks**
    *   [ ] Ensure you are logged in via AWS SSO (`aws sso login`).
    *   [ ] Deploy the certificate stack first. This **must** be deployed to `us-east-1`.
        ```bash
        cd infrastructure
        npx cdk deploy LapsloopCertificateStack --region us-east-1
        ```
    *   [ ] Wait for the certificate to be validated via DNS.
    *   [ ] Deploy the main application stack to `eu-west-1`.
        ```bash
        npx cdk deploy LapsloopDesignStack --region eu-west-1
        ```
    *   [ ] From the CDK output, note the **CloudFront URL** and the **RDS Proxy Endpoint**.
    *   [ ] **Notify Stephane:** "Design environment deployed. The CloudFront URL is: [URL] and the RDS Proxy endpoint is: [ENDPOINT]."

2.  **Gerard: Migrate Database Schema**
    *   [ ] Run the database migration against the new RDS Proxy endpoint using the dedicated wrapper script. This script handles IAM token generation automatically.
        ```bash
        npm run migrate:aws
        ```
    *   [ ] **Notify Stephane:** "Database schema has been pushed to Aurora."

3.  **Stephane: Verify Deployment in AWS Console**
    *   [ ] Check CloudFormation to see the `LapsloopDesignStack` in a `CREATE_COMPLETE` state.
    *   [ ] Verify the Lambda, Aurora cluster, and other resources were created.
    *   [ ] Rotate the database master password in Secrets Manager.
    *   [ ] Ask Gerard to test connectivity to confirm IAM authentication is working correctly.

---

## Phase 5: DNS Cut-Over and Final Testing

1.  **Stephane: Create DNS Record in Route 53**
    *   [ ] In the AWS Console, navigate to the `shouldable.ai` hosted zone.
    *   [ ] Create a `CNAME` record for `design.shouldable.ai`.
    *   [ ] Point it to the CloudFront distribution URL provided by Gerard.
    *   [ ] **Notify Gerard:** "The `design` subdomain now points to CloudFront."

2.  **Gerard: Final App Update and Testing**
    *   [ ] Update the `NEXT_PUBLIC_APP_URL` in the code to `https://design.shouldable.ai`.
    *   [ ] Re-run `npx cdk deploy LapsloopDesignStack --region eu-west-1` to apply the environment variable change.
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
*   **VPC Architecture:** Lambda functions must run inside the same VPC and private subnets as the RDS Proxy. Security groups must be chained correctly: Lambda SG → RDS Proxy SG → Aurora cluster SG. A NAT Gateway is required in a public subnet to allow the Lambda function internet egress for the OpenAI API.
*   **IAM Authentication:** The Lambda execution role requires `rds-db:connect` permissions for the RDS Proxy. The `DATABASE_URL` in the Lambda environment must NOT contain a password; the application code must generate a temporary token at runtime.
*   **Connection Pooling:** Prisma should target the RDS Proxy endpoint. The proxy handles connection pooling automatically.

### Prisma in a Lambda Environment
*   **Build Configuration:** The deployment package must include `node_modules/.prisma` and `@prisma/client`. The Prisma schema generator must include `binaryTargets = ["native", "linux-musl-openssl-3.0.x"]`.
*   **Migrations:** Migrations should be stored in the repository and run via a script that can handle IAM authentication (e.g., `npm run migrate:aws`).

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
*   **CI/CD:** The workflow will call `npm run migrate:aws` directly. The environment will already have AWS credentials via OIDC.
*   **Local Development:** A developer runs `npm run migrate:aws` after logging in via `aws sso login`. The script will use their local SSO credentials to generate the token.
