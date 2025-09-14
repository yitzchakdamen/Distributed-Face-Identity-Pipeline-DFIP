# DNS Settings

## Records to Set in DNS Manager

### For API (api.facealert.live) [server]

```text
Type: CNAME
Host: api
Target: <server-dns-target>
TTL: 300
```

You can get the server `DNS Target` url for the `api` host, in the `Custom Domains` section by running this cammand

```bash
heroku domains -a facealert-api
```

### For Main Site (facealert.live)

```text
Type: ALIAS (or ANAME if available)
Host: @
Target: hidden-skink-8pnj6uw9f7tao7e6vni7r0ro.herokudns.com
TTL: 300
```

### For www (<www.facealert.live>)

```text
Type: CNAME
Host: www
Target: genetic-swordtail-uo9293wit79mj3is268f4xtv.herokudns.com
TTL: 300
```

You can get the client `DNS Target` urls for the `@` and `www` hosts, in the `Custom Domains` section by running this cammand

```bash
heroku domains -a facealert-frontend
```

## Setup Instructions

1. Go to DNS Manager for the domain facealert.live
2. Remove all existing records for hosts: @, www, api
3. Add the new records according to the table above

## Checking Setup

After DNS configuration (may take up to 24 hours), check:

```bash
# DNS check
nslookup api.facealert.live
nslookup facealert.live
nslookup www.facealert.live

# SSL check after DNS works
curl -I https://api.facealert.live/health
curl -I https://facealert.live/
```

## Heroku App Names

- **API**: facealert-api (Region: eu)
- **Frontend**: facealert-frontend (Region: eu)
