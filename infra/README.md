# Cyrus AWS Infrastructure

AWS CDK infrastructure for deploying Cyrus as a containerized service on ECS Fargate.

## Architecture

```
                         ┌──────────────┐
   Linear Webhooks ────→ │  CloudFront  │ (HTTPS termination)
   OAuth Callbacks ────→ │ *.cf.net:443 │
   Admin Dashboard ────→ └──────┬───────┘
                                │ HTTP :80
                         ┌──────▼──────┐
                         │     ALB     │ (internal, private)
                         │    :80      │
                         └──────┬──────┘
                                │
                         ┌──────▼──────┐
                         │   Fargate   │ (private subnet)
                         │  Cyrus Task │ :3456
                         │  2 vCPU/4GB │
                         └──────┬──────┘
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                   │
      ┌──────▼──────┐   ┌──────▼──────┐    ┌──────▼──────┐
      │     EFS     │   │   Secrets   │    │     ECR     │
      │ /cyrus-data │   │   Manager   │    │ cyrus:latest│
      └─────────────┘   └─────────────┘    └─────────────┘
```

**Key components:**

- **CloudFront** — Provides HTTPS termination via a `*.cloudfront.net` URL. All traffic (webhooks, OAuth callbacks, admin dashboard) goes through CloudFront. This eliminates the need for a custom domain or ACM certificate just to get HTTPS working with Linear.
- **ALB** — Internal application load balancer sitting between CloudFront and Fargate. Routes HTTP traffic to the container. Not directly exposed to Linear; use the CloudFront URL instead.
- **ECS Fargate** — Single task (Cyrus is stateful: in-memory sessions + filesystem worktrees)
- **EFS** — Persistent storage mounted at `/home/cyrus/.cyrus` for repos, worktrees, and config
- **Secrets Manager** — Stores Linear OAuth credentials, Anthropic API key, and admin token
- **ECR** — Private Docker image registry

## Stacks

| Stack | Description |
|-------|-------------|
| `CyrusVpc` | VPC with 2 AZs, public + private subnets, 1 NAT gateway |
| `CyrusService` | ECS cluster, Fargate task, EFS, ALB, CloudFront, ECR, Secrets Manager |

## Prerequisites

- AWS CLI configured with credentials
- Node.js 20+
- Docker (for building the container image)

## Quick Start

### 1. Install dependencies

```bash
cd infra
npm install
```

### 2. Synthesize CloudFormation templates

```bash
npx cdk synth
```

### 3. Deploy the stacks

```bash
npx cdk deploy --all
```

After deployment, note the outputs:
- **CloudFrontUrl** — your HTTPS base URL (use this everywhere)
- **WebhookUrl** — webhook URL to configure in Linear
- **CallbackUrl** — OAuth callback URL for Linear app settings
- **AdminDashboardUrl** — admin dashboard URL
- **EcrRepositoryUri** — push your Docker image here
- **SecretsArn** — update with your real credentials

### 4. Update secrets

Replace placeholder values in Secrets Manager:

```bash
aws secretsmanager put-secret-value \
  --secret-id cyrus/config \
  --secret-string '{
    "LINEAR_CLIENT_ID": "your-client-id",
    "LINEAR_CLIENT_SECRET": "your-client-secret",
    "LINEAR_WEBHOOK_SECRET": "your-webhook-secret",
    "ANTHROPIC_API_KEY": "sk-ant-...",
    "CYRUS_ADMIN_TOKEN": "your-admin-token"
  }'
```

### 5. Build and push the Docker image

```bash
# From monorepo root
docker build -t cyrus:latest .

# Authenticate with ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ECR_URI>

# Tag and push
docker tag cyrus:latest <ECR_URI>:latest
docker push <ECR_URI>:latest
```

### 6. Force a new deployment

```bash
aws ecs update-service --cluster cyrus --service <service-name> --force-new-deployment
```

## CloudFront

CloudFront is deployed automatically and provides:

- **HTTPS termination** — Linear requires HTTPS webhook URLs. CloudFront provides a free `*.cloudfront.net` domain with a valid TLS certificate, so you don't need a custom domain or ACM certificate.
- **Traffic flow** — `Linear → CloudFront (HTTPS) → ALB (HTTP) → Fargate`. CloudFront forwards all HTTP methods (including POST for webhooks) with caching disabled.
- **Viewer protocol policy** — HTTP requests are automatically redirected to HTTPS.

After deployment, the CDK outputs `CloudFrontUrl`, `WebhookUrl`, and `CallbackUrl`. Use the CloudFront URL (not the ALB DNS name) when configuring Linear.

## Admin Dashboard

The admin dashboard is available at:

```
https://<cloudfront-domain>/admin?token=<CYRUS_ADMIN_TOKEN>
```

Features:
- **Status** — instance version, uptime, webhook stats, active sessions
- **Repositories** — view, add, and remove repository configurations
- **Logs** — real-time log viewer with auto-refresh
- **Linear Auth** — re-authorize OAuth tokens
- **GitHub** — check/configure GitHub CLI auth
- **Config** — raw config.json editor
- **Environment** — set environment variables

The admin token is stored in Secrets Manager as `CYRUS_ADMIN_TOKEN`. First-time setup requires visiting the URL with the token as a query parameter; the token is then stored in browser localStorage for subsequent visits.

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `LINEAR_DIRECT_WEBHOOKS` | **Yes** | Must be `true`. Tells Cyrus to validate webhooks using Linear's `linear-signature` header instead of expecting a Bearer token from the proxy. **If missing, all webhooks will be silently rejected.** |
| `LINEAR_CLIENT_ID` | Yes | Linear OAuth application client ID |
| `LINEAR_CLIENT_SECRET` | Yes | Linear OAuth application client secret |
| `LINEAR_WEBHOOK_SECRET` | Yes | Linear webhook signing secret (for signature verification) |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude Code |
| `CYRUS_ADMIN_TOKEN` | Yes | Bearer token for admin dashboard API authentication |
| `CYRUS_HOST_EXTERNAL` | Yes | Must be `true`. Makes Fastify bind to `0.0.0.0` so ALB health checks reach the container |
| `CYRUS_SERVER_PORT` | Yes | Port Cyrus listens on (default `3456`) |
| `CYRUS_BASE_URL` | Recommended | The CloudFront HTTPS URL (e.g., `https://abc123.cloudfront.net`). Used for OAuth callback construction |
| `NODE_ENV` | No | Set to `production` for production deployments |
| `GH_TOKEN` | No | GitHub personal access token for PR creation (can be set via admin dashboard) |
| `CYRUS_LOG_LEVEL` | No | Log level: `DEBUG`, `INFO`, `WARN`, `ERROR`, `SILENT` (default: `INFO`) |
| `CYRUS_WEBHOOK_DEBUG` | No | Set to `true` to log full webhook payloads |

The CDK stack sets `LINEAR_DIRECT_WEBHOOKS`, `CYRUS_HOST_EXTERNAL`, `CYRUS_SERVER_PORT`, and `NODE_ENV` as container environment variables. Secrets (`LINEAR_CLIENT_ID`, `LINEAR_CLIENT_SECRET`, etc.) are injected from Secrets Manager.

## Linear Webhook Configuration

1. Go to **Linear Settings → API → OAuth Applications**
2. Select your Cyrus OAuth application
3. Set **Webhook URL** to: `https://<cloudfront-domain>/webhook`
4. Set **Callback URL** to: `https://<cloudfront-domain>/callback`
5. Enable these webhook events:
   - **Agent session events** (required)
   - **Inbox notifications** (recommended)
   - **Permission changes** (recommended)
6. Save and copy the **Webhook Signing Secret** into Secrets Manager

## Updating and Redeploying

### Code changes

```bash
# 1. Build the new Docker image from monorepo root
docker build -t cyrus:latest .

# 2. Authenticate with ECR
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <ECR_URI>

# 3. Tag and push
docker tag cyrus:latest <ECR_URI>:latest
docker push <ECR_URI>:latest

# 4. Force ECS to pull the new image
aws ecs update-service \
  --cluster cyrus \
  --service <service-name> \
  --force-new-deployment

# 5. Watch the deployment
aws ecs wait services-stable --cluster cyrus --services <service-name>
```

### Infrastructure changes

```bash
cd infra
npx cdk diff     # Preview changes
npx cdk deploy --all  # Apply changes
```

### Rotating secrets

```bash
# Update one or more secrets
aws secretsmanager put-secret-value \
  --secret-id cyrus/config \
  --secret-string '{ ... updated values ... }'

# Force ECS to pick up the new secrets (requires new task)
aws ecs update-service --cluster cyrus --service <service-name> --force-new-deployment
```

## Troubleshooting

### "Linear did not respond" / Webhooks not processed

**Symptom:** Issues assigned to Cyrus show "did not respond" in Linear.

**Cause:** Missing `LINEAR_DIRECT_WEBHOOKS=true` in the container environment. Without this, Cyrus runs in proxy mode and expects a Bearer token on incoming webhooks. Linear sends webhooks with a `linear-signature` header instead, causing silent rejection.

**Fix:** Verify the environment variable is set:
```bash
# Check via ECS Exec
aws ecs execute-command --cluster cyrus --task <task-id> \
  --container cyrus --interactive --command "printenv LINEAR_DIRECT_WEBHOOKS"
```
If missing, update the CDK stack or add it to `.env` on the EFS volume and redeploy.

### Container fails health checks

**Symptom:** ECS keeps restarting the task.

**Fix:**
1. Check container logs: `aws logs tail /ecs/cyrus --follow`
2. Verify secrets are populated (not `CHANGE_ME`)
3. Ensure EFS mount is accessible

### ECS Exec for debugging

```bash
# Find the running task ID
aws ecs list-tasks --cluster cyrus --service-name <service-name>

# Connect to the container
aws ecs execute-command \
  --cluster cyrus \
  --task <task-id> \
  --container cyrus \
  --interactive \
  --command /bin/bash
```

### CloudFront returns 502/504

**Symptom:** CloudFront returns a bad gateway error.

**Fix:**
1. Check ALB target health: the Fargate task must be registered and healthy
2. Verify the container is listening on port 3456
3. Check security group rules allow ALB → Fargate on port 3456

### OAuth callback fails

**Symptom:** After authorizing in Linear, the callback page shows an error.

**Fix:**
1. Verify `CYRUS_BASE_URL` matches the CloudFront URL
2. Verify the Linear OAuth app's callback URL matches `https://<cloudfront-domain>/callback`
3. Check that `LINEAR_CLIENT_ID` and `LINEAR_CLIENT_SECRET` are correct

## Cost Overview

Estimated monthly cost for a single Cyrus instance (~$115-130/mo):

| Service | Estimated Cost | Notes |
|---------|---------------|-------|
| ECS Fargate (2 vCPU, 4GB) | ~$70/mo | Always-on single task |
| NAT Gateway | ~$32/mo | 1 gateway + data processing |
| ALB | ~$16/mo | Fixed hourly + LCU charges |
| EFS | ~$1-5/mo | Depends on storage used |
| CloudFront | ~$0-1/mo | Minimal traffic volume |
| ECR | ~$0-1/mo | Image storage |
| Secrets Manager | ~$0.40/mo | 1 secret |
| CloudWatch Logs | ~$0-2/mo | 2-week retention |

To reduce costs:
- Use **Fargate Spot** for non-critical workloads (~70% savings on compute)
- Use a **smaller task size** (0.5 vCPU / 1GB) if Cyrus handles low volume
- Use a **VPC endpoint for ECR** to avoid NAT Gateway data charges for image pulls

## HTTPS with Custom Domain (Optional)

To use a custom domain instead of the CloudFront URL:

```bash
npx cdk deploy --all \
  -c certificateArn=arn:aws:acm:us-east-1:123456789:certificate/abc-123 \
  -c domainName=cyrus.example.com
```

This adds an HTTPS listener on the ALB and redirects HTTP → HTTPS. You'll need to create a CNAME/A record pointing your domain to the ALB DNS name.

Note: Even with a custom domain on the ALB, the CloudFront distribution remains available as a fallback.

## Design Decisions

- **Single instance (`desiredCount: 1`)** — Cyrus is stateful with in-memory session maps and filesystem-bound git worktrees. Horizontal scaling requires architectural changes.
- **EFS over EBS** — Fargate doesn't support EBS volumes; EFS is the only persistent storage option.
- **UID 1000 alignment** — The Dockerfile creates a `cyrus` user with UID 1000, and the EFS access point enforces the same UID/GID. This ensures file permissions work correctly.
- **`CYRUS_HOST_EXTERNAL=true`** — Required so Fastify binds to `0.0.0.0` instead of `localhost`, allowing the ALB to reach the container.
- **CloudFront for HTTPS** — Provides free HTTPS termination without requiring a custom domain or ACM certificate. Linear requires HTTPS webhook URLs.
- **No Cloudflare tunnel** — The ALB + CloudFront replaces it for webhook ingress. The tunnel only activates when `CLOUDFLARE_TOKEN` is set (which is not provided here).
- **ECS Exec enabled** — Allows `aws ecs execute-command` for debugging running containers.

## Verification

After deployment, verify the service is healthy:

```bash
# Check the health endpoint via CloudFront
curl https://<cloudfront-domain>/status
# Expected: {"status":"idle"}

# Check ECS service status
aws ecs describe-services --cluster cyrus --services <service-name>

# View container logs
aws logs tail /ecs/cyrus --follow

# ECS Exec into the running container
aws ecs execute-command --cluster cyrus --task <task-id> \
  --container cyrus --interactive --command /bin/bash
```
