# Quick Start Guide

Get started with LumoAuth in minutes. This guide walks you through signing up, configuring your tenant, and authenticating your first user.

---

## Prerequisites

- A LumoAuth account - [sign up at app.lumoauth.dev](https://app.lumoauth.dev)
- A tool to make HTTP requests (curl, Postman, or your preferred language)

---

## Step 1: Sign Up and Create Your Tenant

1. Go to [app.lumoauth.dev](https://app.lumoauth.dev) and create an account
2. During onboarding, you'll create your first **tenant** - an isolated identity environment for your organization
3. Choose a **tenant slug** (e.g., `acme-corp`) - this becomes part of your URLs

Your tenant is now live at:

```
https://app.lumoauth.dev/t/acme-corp/portal/
```

:::tip[What's a tenant?]
A tenant is your organization's private identity environment. All your users, applications, roles, and settings are scoped to your tenant and completely isolated from other tenants on the platform.
:::

---

## Step 2: Explore the Tenant Portal

Navigate to your tenant portal at:

```
https://app.lumoauth.dev/t/acme-corp/portal/
```

The portal dashboard gives you an overview of your tenant with quick links to:

- **Applications** - Register OAuth/SAML applications
- **Access Management** - Manage users, roles, groups, and permissions
- **Configuration** - Authentication settings, social login, MFA, SSO
- **Security** - Audit logs, signing keys, custom domains

---

## Step 3: Configure Authentication

Go to **Configuration** → **Auth Settings** at:
```
/t/acme-corp/portal/configuration/auth-settings
```

### Basic Settings

- **Allow Registration** - Enable user self-registration
- **Require Email Verification** - Users must verify email before access
- **Password Policy** - Set password complexity requirements

### Enable Social Login (Optional)

1. Go to **Configuration** → **Social Login**
2. Select a provider (e.g., Google)
3. Enter your OAuth client ID and secret from the provider's developer console
4. Save and enable

### Configure MFA (Optional)

1. Under **Multi-Factor Authentication**, enable TOTP, SMS, or Email
2. Optionally enable **Adaptive MFA** for risk-based authentication

---

## Step 4: Register an OAuth Application

Go to **Applications** at:
```
/t/acme-corp/portal/applications
```

1. Click **Create Application**
2. Fill in:
   - **Name**: `My Web App`
   - **Redirect URI**: `https://myapp.example.com/callback`
   - **Grant Types**: Authorization Code
3. Save - you'll receive a **Client ID** and **Client Secret**

---

## Step 5: Authenticate a User

### Initiate OAuth Login

Redirect users to the authorization endpoint:

```
https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://myapp.example.com/callback&
  scope=openid profile email&
  state=RANDOM_STATE
```

### Exchange the Code for Tokens

After the user authenticates, exchange the authorization code:

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -d grant_type=authorization_code \
  -d code=AUTHORIZATION_CODE \
  -d redirect_uri=https://myapp.example.com/callback \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET
```

Response:

```json
{
  "access_token": "eyJ...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def...",
  "id_token": "eyJ..."
}
```

---

## Step 6: Verify the Setup

### Check OIDC Discovery

```bash
curl https://app.lumoauth.dev/t/acme-corp/api/v1/.well-known/openid-configuration
```

### Get User Info

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/userinfo
```

---

## What's Next?

Now that your tenant is set up with an OAuth application, explore these features:

| Feature | Guide |
|---------|-------|
| Add social login | [Social Login Guide](../authentication/social-login.md) |
| Enable MFA | [MFA Guide](../authentication/mfa.md) |
| Set up adaptive authentication | [Adaptive MFA Guide](../authentication/adaptive-mfa.md) |
| Configure RBAC | [Roles & Permissions](../access-control/roles-permissions.md) |
| Invite users | [User Invitations](../user-management/invitations.md) |
| Set up SCIM provisioning | [SCIM 2.0 Guide](../integrations/scim.md) |
| Enable GDPR compliance | [GDPR Guide](../compliance/gdpr.md) |
| Connect webhooks | [Webhooks Guide](../integrations/webhooks.md) |
