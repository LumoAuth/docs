# Configuring Your Tenant

This guide walks you through configuring your LumoAuth tenant step by step - from authentication settings to a working login flow.

---

## What You'll Set Up

By the end of this guide, you'll have:

1. Authentication configured (email/password + optional social login)
2. An OAuth application registered
3. Users added to your tenant
4. A working login flow

---

## Step 1: Access Your Tenant Portal

Navigate to your tenant portal:

```
https://app.lumoauth.dev/t/{your-tenant-slug}/portal/
```

The portal dashboard shows an overview of your tenant with quick links to all management sections.

:::tip[Find your tenant slug]
Your tenant slug is the URL-safe identifier you chose when creating your account (e.g., `acme-corp`). You can find it in your account settings or in the URL of your portal.
:::

---

## Step 2: Configure Authentication Settings

Go to **Configuration** → **Auth Settings** at:
```
/t/acme-corp/portal/configuration/auth-settings
```

### Basic Settings

- **Allow Registration** - Enable/disable user self-registration
- **Require Email Verification** - Users must verify their email before accessing the app
- **Password Policy** - Set minimum length, complexity requirements

### Enable MFA (Optional)

Under the MFA section:

1. Enable **TOTP (Authenticator App)** - Users can enroll with Google Authenticator, Authy, etc.
2. Enable **Email MFA** - Send one-time codes via email
3. Enable **SMS MFA** - Send one-time codes via SMS (requires SMS provider configuration)

### Enable Adaptive MFA (Optional)

Toggle **Adaptive Authentication** to enable risk-based MFA:

- **Low Risk** → No MFA required
- **Medium Risk** → Prompt for MFA
- **High Risk** → Block and alert

The risk engine considers: device fingerprint, IP reputation, geolocation, geo-velocity (impossible travel), and behavioral patterns.

---

## Step 3: Add Social Login Providers (Optional)

Go to **Configuration** → **Social Login** at:
```
/t/acme-corp/portal/configuration/social-login
```

To add Google login:

1. Click **Add Provider** → Select **Google**
2. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
3. Save and **Enable** the provider

Repeat for GitHub, Microsoft, Facebook, Apple, or LinkedIn as needed.

Users will now see social login buttons on the login page.

---

## Step 4: Create an OAuth Application

Go to **Applications** at:
```
/t/acme-corp/portal/applications
```

1. Click **Create Application**
2. Fill in:
   - **Name**: `My Web App`
   - **Type**: Web Application
   - **Redirect URIs**: `https://myapp.example.com/callback`
   - **Allowed Grant Types**: Authorization Code, Refresh Token
   - **Scopes**: `openid`, `profile`, `email`
3. Click **Save**

You'll receive:
- **Client ID**: `client_abc123...`
- **Client Secret**: `secret_xyz789...`

Save these credentials - you'll need them to integrate your application.

---

## Step 5: Add Users

### Option A: User Self-Registration

If registration is enabled, users can sign up at your tenant's login page. Share the URL:
```
https://app.lumoauth.dev/t/acme-corp/login
```

### Option B: Create Users Manually

Go to **Access Management** → **Users** at:
```
/t/acme-corp/portal/access-management/users
```

1. Click **Create User**
2. Fill in email, name, and optionally a temporary password
3. Assign roles and groups
4. Click **Create**

### Option C: Invite Users

Go to **Access Management** → **Invite Users** at:
```
/t/acme-corp/portal/access-management/invite-users
```

1. Enter email addresses (one per line)
2. Select roles to assign
3. Click **Send Invitations**

Invited users receive an email with a registration link.

---

## Step 6: Set Up Roles & Permissions

Go to **Access Management** → **Roles** at:
```
/t/acme-corp/portal/access-management/roles
```

### Create a Role

1. Click **Create Role**
2. Enter:
   - **Name**: `Editor`
   - **Description**: `Can read and edit content`
3. Assign permissions:
   - `content:read`
   - `content:write`
   - `content:publish`
4. Click **Save**

### Assign Roles to Users

1. Go to **Users** → Select a user
2. Under **Roles**, click **Assign Role**
3. Select one or more roles
4. Save

---

## Step 7: Test the Login Flow

### OIDC Discovery

Verify your tenant's OIDC configuration:

```bash
curl https://app.lumoauth.dev/t/acme-corp/api/v1/.well-known/openid-configuration
```

### Initiate Login

Open this URL in a browser (replace `YOUR_CLIENT_ID`):

```
https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://myapp.example.com/callback&
  scope=openid profile email&
  state=random_state_value
```

This will:

1. Show the login page
2. User enters credentials (or uses social login)
3. If MFA is enabled, prompt for second factor
4. Redirect back to your app with an authorization code
5. Your app exchanges the code for tokens

---

## Step 8: Verify with API

Exchange the authorization code:

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -d grant_type=authorization_code \
  -d code=YOUR_AUTH_CODE \
  -d redirect_uri=https://myapp.example.com/callback \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET
```

Get user info:

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/userinfo
```

---

## Congratulations!

You've successfully configured your LumoAuth tenant with:

- ✅ Authentication configuration
- ✅ OAuth application registration
- ✅ User management
- ✅ Working login flow

## Next Steps

| What to Do | Guide |
|------------|-------|
| Enable enterprise SSO | [Enterprise SSO](../authentication/enterprise-sso.md) |
| Set up adaptive MFA | [Adaptive MFA](../authentication/adaptive-mfa.md) |
| Configure fine-grained authorization | [Zanzibar](../access-control/zanzibar.md) |
| Enable SCIM provisioning | [SCIM 2.0](../integrations/scim.md) |
| Set up audit logging | [Audit Logs](../compliance/audit-logs.md) |
| Configure webhooks | [Webhooks](../integrations/webhooks.md) |
