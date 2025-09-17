# Heroku Deployment Troubleshooting

## Current Issue

The deployment to Heroku is failing with the error:
```
fatal: 'heroku' does not appear to be a git repository
fatal: Could not read from remote repository.
```

## Root Cause

The deployment fails with "Invalid credentials provided" error, indicating that the `HEROKU_API_KEY` secret in GitHub is invalid or expired.

**Current Error:**
```
Error: Invalid credentials provided.
Error ID: unauthorized
The token provided to HEROKU_API_KEY is invalid.
```

This can be caused by:

1. **Missing or incorrect GitHub Secrets**
2. **Heroku apps don't exist**
3. **Incorrect permissions or API key**

## Steps to Fix

### 1. Verify GitHub Secrets

Go to GitHub Repository → Settings → Secrets and variables → Actions

Ensure the following secrets are set correctly:

- `HEROKU_API_KEY` - Your Heroku API key
- `HEROKU_API_APP_NAME` - Backend app name (without .herokuapp.com)
- `HEROKU_FRONTEND_APP_NAME` - Frontend app name (without .herokuapp.com)
- `HEROKU_EMAIL` - Your Heroku account email

### 2. Get New Heroku API Key (CRITICAL FIX)

The current `HEROKU_API_KEY` is invalid. Generate a new one:

```bash
# Install Heroku CLI if not installed
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku (this will open browser)
heroku login

# Get a fresh API key
heroku auth:token
```

**Important**: Copy the entire output token and update `HEROKU_API_KEY` in GitHub secrets immediately.

### 3. Create Heroku Apps (if they don't exist)

```bash
# Create API app
heroku create your-api-app-name

# Create Frontend app
heroku create your-frontend-app-name

# Verify apps exist
heroku apps
```

### 4. Set Correct App Names in Secrets

The app names in GitHub secrets should match exactly with the Heroku app names:
- If your app URL is `https://my-api-app.herokuapp.com`
- Then `HEROKU_API_APP_NAME` should be `my-api-app`

### 5. Test Deployment Locally (Optional)

```bash
# Test API deployment
cd fs-dashboard/server
heroku git:remote -a your-api-app-name
git add .
git commit -m "test deploy"
git push heroku main

# Test Frontend deployment
cd ../client
heroku git:remote -a your-frontend-app-name
npm run build
git add .
git commit -m "test deploy"
git push heroku main
```

## Verification

After setting up the secrets correctly:

1. **Check if secrets are accessible**: The workflow now includes a verification step
2. **Monitor workflow logs**: Check the "Verify Heroku app exists" step in GitHub Actions
3. **Test on a small change**: Make a minor commit to trigger the workflow

## Common Issues

### Issue: "App not found"
**Solution**: Create the Heroku apps or check the app names in secrets

### Issue: "Authentication failure"
**Solution**: Regenerate Heroku API key and update the GitHub secret

### Issue: "Permission denied"
**Solution**: Ensure your Heroku account has access to the apps

## Alternative Deployment Methods

If the current action continues to fail, consider:

1. **Use official Heroku GitHub integration**
2. **Use different Heroku deploy action**
3. **Manual deployment via Heroku CLI**

## Updated Workflow Features

The workflow has been updated with:
- Verification step to check app existence
- Added `procfile` specification
- Added `dontautocreate: true` to prevent unwanted app creation
- Better error handling

## Next Steps

1. Set up the GitHub secrets correctly
2. Create Heroku apps if they don't exist
3. Test the deployment with a small change
4. Monitor the workflow execution logs
