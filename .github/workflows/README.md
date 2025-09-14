# GitHub Actions Workflows

## deploy-heroku.yml

This file contains the configuration for automatic deployment to Heroku with separate domains.

### Triggers

- Push to `r-el/fs-dashboard` branch
- Merged PR to `r-el/fs-dashboard` branch

### Deployment Process

**Two separate jobs running in parallel:**

1. **deploy-api**: Deploys Node.js API to facealert-api
2. **deploy-frontend**: Deploys React client to facealert-frontend

### Required Environment Variables

- `HEROKU_API_KEY` - Heroku API key
- `HEROKU_API_APP_NAME` - facealert-api
- `HEROKU_FRONTEND_APP_NAME` - facealert-frontend
- `HEROKU_EMAIL` - <your-heroku-mail@example.com>

### Result

Two separate applications:

- **API**: api.facealert.live (Node.js Express)
- **Frontend**: facealert.live (React SPA)

### Additional Documentation

For complete setup instructions:

- [Heroku Deployment](../../fs-dashboard/docs/deploy/HEROKU_DEPLOY.md) - Detailed deployment guide
- [GitHub Secrets](../../fs-dashboard/docs/deploy/GITHUB_SECRETS.md) - GitHub Secrets configuration
- [DNS Setup](../../fs-dashboard/docs/deploy/DNS_SETUP.md) - DNS configuration with real Heroku data

- `https://api.facealert.live/health` - Server health check
- `https://facealert.live/` - Main application

## Troubleshooting

### Checking API Logs

```bash
heroku logs --tail -a facealert-api
```

### Checking Frontend Logs

```bash
heroku logs --tail -a facealert-frontend
```

### Restarting

```bash
heroku restart -a facealert-api
heroku restart -a facealert-frontend
```
