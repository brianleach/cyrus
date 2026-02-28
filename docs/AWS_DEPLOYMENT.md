# AWS Deployment Guide

End-to-end guide for deploying Cyrus on AWS using ECS Fargate, with infrastructure managed by AWS CDK.

> **Tip:** If you're using Claude, Cursor, or any AI coding agent, ask it to read this file and `infra/README.md` together for the full picture.

---

## Prerequisites

- **AWS CLI** configured with credentials (`aws configure`)
- **Node.js** 20+ and **npm**
- **Docker** (for building the container image)
- **AWS CDK CLI**: `npm install -g aws-cdk`
- **Linear workspace** with admin access
- An **Anthropic API key** from [console.anthropic.com](https://console.anthropic.com/)

---

## Step 1: Deploy Infrastructure

### 1.1 Bootstrap CDK (first time only)

```bash
cdk bootstrap aws://<ACCOUNT_ID>/<REGION>
```

### 1.2 Install dependencies and deploy

```bash
cd infra
npm install
npx cdk deploy --all
```

This creates:
- VPC with public and private subnets
- ECS Fargate cluster with a single task
- EFS for persistent storage
- ALB for internal routing
- CloudFront for HTTPS termination
- ECR for Docker images
- Secrets Manager for credentials

### 1.3 Save the outputs

After deployment, CDK prints outputs. Save these values:

| Output | Use |
|--------|-----|
| `CloudFrontUrl` | Your HTTPS base URL |
| `WebhookUrl` | Webhook URL for Linear |
| `CallbackUrl` | OAuth callback URL for Linear |
| `AdminDashboardUrl` | Admin dashboard |
| `EcrRepositoryUri` | Docker image registry |
| `SecretsArn` | Secrets Manager ARN |

---

## Step 2: Configure Secrets

Update Secrets Manager with your real credentials:

```bash
aws secretsmanager put-secret-value \
  --secret-id cyrus/config \
  --secret-string '{
    "LINEAR_CLIENT_ID": "your-client-id",
    "LINEAR_CLIENT_SECRET": "your-client-secret",
    "LINEAR_WEBHOOK_SECRET": "your-webhook-secret",
    "ANTHROPIC_API_KEY": "sk-ant-...",
    "CYRUS_ADMIN_TOKEN": "choose-a-strong-token"
  }'
```

The `CYRUS_ADMIN_TOKEN` is a password you choose for the admin dashboard. You'll use it to authenticate at `/admin?token=<YOUR_TOKEN>`.

---

## Step 3: Build and Push Docker Image

From the monorepo root:

```bash
# Build
docker build -t cyrus:latest .

# Authenticate with ECR (replace with your ECR URI)
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ECR_URI>

# Tag and push
docker tag cyrus:latest <ECR_URI>:latest
docker push <ECR_URI>:latest
```

---

## Step 4: Start the Service

Force ECS to pull the new image and start:

```bash
aws ecs update-service \
  --cluster cyrus \
  --service <service-name> \
  --force-new-deployment

# Wait for it to stabilize
aws ecs wait services-stable --cluster cyrus --services <service-name>
```

Verify the service is healthy:

```bash
curl https://<cloudfront-domain>/status
# Expected: {"status":"idle"}
```

---

## Step 5: Create Linear OAuth Application

Follow the detailed steps in [SELF_HOSTING.md — Step 3](./SELF_HOSTING.md#step-3-create-linear-oauth-application), but use these URLs:

- **Callback URL:** `https://<cloudfront-domain>/callback`
- **Webhook URL:** `https://<cloudfront-domain>/webhook`

After creating the app, update Secrets Manager with the credentials (see Step 2) and force a new deployment.

---

## Step 6: Authorize via Admin Dashboard

1. Open `https://<cloudfront-domain>/admin?token=<CYRUS_ADMIN_TOKEN>`
2. Go to **Linear Auth** tab
3. Click **Authorize with Linear**
4. Complete the OAuth flow in the new tab
5. Verify the workspace name appears

---

## Step 7: Add Repositories

In the admin dashboard:

1. Go to **Repositories** tab
2. Click **Add Repository**
3. Fill in:
   - **Name:** e.g., `my-app`
   - **Path:** `/home/cyrus/repos/my-app` (Cyrus will clone here)
   - **Base Branch:** `main`
   - **GitHub URL:** `https://github.com/org/repo`
4. Click **Add Repository**

Alternatively, use ECS Exec to run CLI commands:

```bash
aws ecs execute-command --cluster cyrus --task <task-id> \
  --container cyrus --interactive --command /bin/bash

# Inside the container:
cyrus self-add-repo https://github.com/org/repo.git
```

---

## Step 8: Verify End-to-End

1. In Linear, assign an issue to Cyrus (or mention @Cyrus in a comment)
2. Check the admin dashboard **Status** page for active sessions
3. Check the **Logs** tab for real-time processing information
4. Verify Cyrus responds in the Linear issue thread

---

## What's Next

- **GitHub auth:** Configure `GH_TOKEN` via the admin dashboard's GitHub tab so Cyrus can create pull requests
- **Configuration:** Customize tool permissions, issue routing, and MCP servers via the Config tab
- **Monitoring:** Use the Logs tab or CloudWatch Logs (`/ecs/cyrus`) to monitor operations

For the complete environment variables reference, troubleshooting guide, and cost breakdown, see [infra/README.md](../infra/README.md).

For self-hosting without AWS (local machine, VPS, etc.), see [SELF_HOSTING.md](./SELF_HOSTING.md).
