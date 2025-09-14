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
heroku config:set NODE_ENV=production ALLOWED_ORIGINS=https://facealert.live,https://www.facealert.live -a facealert-api
```

##### For client

```bash
heroku config:set NODE_ENV=production -a facealert-frontend
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
