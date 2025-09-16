# Heroku Deploy Docs

## Heroku Deploy

### Create the client and server apps

#### Check Heroku CLI version

```bash
heroku --version
```

#### Check Heroku Auth

```bash
heroku auth:whoami
```

#### Create new apps at eu region

```bash
heroku create facealert-api --region eu
heroku create facealert-frontend --region eu
```

#### Add custom domains

```bash
heroku domains:add api.facealert.live -a facealert-api
heroku domains:add api.facealert.live -a facealert-api
heroku domains:add www.facealert.live -a facealert-frontend
```

#### Set production environment variables

##### For server

```bash
# Basic environment
heroku config:set NODE_ENV=production -a facealert-api

# CORS settings
heroku config:set ALLOWED_ORIGINS=https://facealert.live,https://www.facealert.live -a facealert-api

# Authentication settings
heroku config:set JWT_SECRET=your-super-secret-jwt-key-here -a facealert-api
heroku config:set BCRYPT_SALT_ROUNDS=10 -a facealert-api

# Supabase configuration (REQUIRED)
heroku config:set SUPABASE_URL=your-supabase-project-url -a facealert-api
heroku config:set SUPABASE_ANON_KEY=your-supabase-anon-key -a facealert-api

# MongoDB configuration
heroku config:set MONGODB_URI=your-mongodb-connection-string -a facealert-api

# Server settings
heroku config:set PORT=3000 -a facealert-api
```

**Important Notes:**

- Replace `your-supabase-project-url` with your actual Supabase project URL
- Replace `your-supabase-anon-key` with your Supabase anonymous key
- Generate a strong JWT secret (recommended: 32+ random characters)

##### For client

```bash
heroku config:set NODE_ENV=production -a facealert-frontend
heroku config:set REACT_APP_API_URL=https://api.facealert.live -a facealert-frontend
```

#### Enable SSL certificates

```bash
# Enable automatic SSL for API
heroku certs:auto:enable -a facealert-api

# Enable automatic SSL for frontend  
heroku certs:auto:enable -a facealert-frontend
```

#### Verify SSL status

```bash
# Check API SSL
heroku certs -a facealert-api

# Check frontend SSL
heroku certs -a facealert-frontend
```

#### DNS information

##### To check the DNS information that needs to be configured

###### DNS for server

```bash
heroku domains -a facealert-api
```

###### DNS for client

```bash
heroku domains -a facealert-frontend
```

### Check that the apps are working

#### Check server app

Get the server domain from the DNS information (`heroku domains -a facealert-api`)

```bash
curl <server-domain/health>
```

For example

```bash
curl https://facealert-api-0a992bc444dd.herokuapp.com/health
```

#### Check client app

Get the server domain from the DNS information (`heroku domains -a facealert-frontend`)

```bash
curl <client-domain>
```

For example

```bash
curl https://facealert-frontend-2f8031e1bcc2.herokuapp.com/
```

#### DNS configuration

Instructions for setting up DNS are in the [docs/deploy/DNS_SETUP.md](DNS_SETUP.md) file.
