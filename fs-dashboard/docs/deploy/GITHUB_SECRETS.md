# GitHub Secrets

## GitHub Secrets Configuration

We need to set the following Secrets in the GitHub Repository:

### 1. In GitHub Repository, go to: Settings → Secrets and variables → Actions

### 2. Add the following Secrets

- **HEROKU_API_KEY**: Your Heroku API key
  - To get the key via Dashboard: Heroku Dashboard → Account Settings → API Key
  - To get the key via CLI: Run `heroku auth:token` in your terminal (requires Heroku CLI installed and logged in)

- **HEROKU_API_APP_NAME**: Name of the API app on Heroku (without the .herokuapp.com domain)

- **HEROKU_FRONTEND_APP_NAME**: Name of the Frontend app on Heroku

- **HEROKU_EMAIL**: Your email address on Heroku

```env
HEROKU_API_KEY=your_heroku_api_key
HEROKU_API_APP_NAME=facealert-api
HEROKU_FRONTEND_APP_NAME=facealert-frontend
HEROKU_EMAIL=your-heroku-mail@example.com
```
