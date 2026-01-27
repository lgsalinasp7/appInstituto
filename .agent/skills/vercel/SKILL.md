---
name: vercel
description: >
  Manages Vercel deployments, environment variables, and project settings.
  Trigger: When user asks to deploy, check deployments, or manage Vercel env vars.
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

- Deploying the application to Vercel (Production or Preview).
- Managing project environment variables.
- Checking deployment status or logs.
- Linking the local project to a Vercel project.

## Critical Patterns

- **CLI Usage**: Prefer the Vercel CLI (`vercel` or `npx vercel`) for most operations.
- **MCP Usage**: If the Vercel MCP server is configured, use its tools for high-level management (listing projects, deployments).
- **Environment Syncing**: Always ensure `.env` matches Vercel environment variables where applicable.

## Commands

```bash
# Login to Vercel
vercel login

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Manage environment variables
vercel env add [key] [value]
vercel env pull .env.local
```

## MCP Tools (if configured)

If `@vercel/mcp` is active, you have access to:
- `vercel_list_deployments`: View recent deployments.
- `vercel_get_env_variables`: Check configured env vars.
- `vercel_create_deployment`: Trigger a new build.

## Resources

- **Official Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel CLI**: [vercel.com/docs/cli](https://vercel.com/docs/cli)
