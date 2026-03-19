# Quickstart Guide

Get started with LumoAuth in under 5 minutes. This guide walks you through your first API call.

:::tip[Prerequisites]
Before you begin, make sure you have:
- Access to a LumoAuth tenant (your organization's instance)
- An OAuth client with Client ID and Client Secret
- A tool to make HTTP requests (curl, Postman, or your favorite language)
:::


## Step 1: Get Your Credentials

Log into the LumoAuth dashboard and navigate to **OAuth Applications**.
Create a new application or use an existing one. You'll need:

| Credential | Description | Example |
| --- | --- | --- |
| `tenant_slug` | Your tenant's unique identifier | `acme-corp` |
| `client_id` | Public identifier for your app | `abc123def456` |
| `client_secret` | Secret key (keep this secure!) | `sk_live_xxxxx` |

## Step 2: Get an Access Token

The simplest way to get started is using the **Client Credentials** grant.
This is ideal for server-to-server communication where no user is involved.

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials" \
  -d "client_id=YOUR_CLIENT_ID" \
  -d "client_secret=YOUR_CLIENT_SECRET" \
  -d "scope=read:users"
```

If successful, you'll receive:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "read:users"
}
```

:::note[What's happening here?]
Your application is authenticating *as itself* (not as a user). The resulting token
represents your application's identity and can be used to call APIs on behalf of the app.
This is different from user authentication where a person logs in.
:::


## Step 3: Use the Token

Now you can use the access token to make authenticated API calls.
Include it in the `Authorization` header:

```bash
# Check a permission
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/authz/check \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permission": "document.view"}'
```

```json
{
  "allowed": true,
  "permission": "document.view"
}
```

## Step 4: (Optional) User Authentication

If you need to authenticate **users** (not just your app), use the
[Authorization Code flow](/oauth/authorize). This involves:

1. **Redirect** the user to LumoAuth's authorization URL
2. **User logs in** and grants permission
3. **Callback** with an authorization code
4. **Exchange** the code for tokens

See the [Authentication Guide](/authentication) for complete details.

## Next Steps

- [**AI Agent Security**](/agents): Set up workload identity and capabilities for autonomous AI agents.
- [**Authorization Overview**](/authorization): Understand RBAC, ABAC, and Zanzibar-style permissions.
- [**OAuth Authentication**](/authentication): Learn about OAuth flows, PKCE, and token types in detail.
