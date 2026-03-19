# Social Login

Let users sign in with their existing accounts from popular identity providers like Google, GitHub, Microsoft, and more. Social login reduces registration friction and improves conversion rates.

---

## Supported Providers

| Provider | Protocol | Features |
|----------|----------|----------|
| **Google** | OAuth 2.0 / OIDC | Email, profile, avatar |
| **GitHub** | OAuth 2.0 | Email, profile, organization membership |
| **Microsoft** | OAuth 2.0 / OIDC | Email, profile, Azure AD integration |
| **Facebook** | OAuth 2.0 | Email, profile, friends list |
| **Apple** | OAuth 2.0 / OIDC | Email (private relay), name |
| **LinkedIn** | OAuth 2.0 | Email, profile, professional info |
| **Custom OIDC** | OpenID Connect | Any OIDC-compliant provider |

---

## How It Works

1. **User clicks a social login button** on your login page
2. **Redirect to provider** - LumoAuth redirects to the provider's authorization page
3. **User authenticates** - Signs in with their existing provider account
4. **Provider callback** - Provider redirects back to LumoAuth with an authorization code
5. **Account linking** - LumoAuth creates or links a local user account
6. **Token issuance** - LumoAuth issues its own OAuth tokens to your application

### Account Linking Behavior

When a user authenticates via social login:

- **New user**: A LumoAuth user account is automatically created (JIT provisioning)
- **Existing user (same email)**: The social account is linked to the existing user
- **Multiple social accounts**: A user can link multiple social providers to one account

---

## Configuration

### Tenant-Level Social Login

Configure social login providers per tenant at:
```
/t/{tenantSlug}/portal/configuration/social-login
```

For each provider, you'll need:

1. **Client ID** - From the provider's developer console
2. **Client Secret** - From the provider's developer console
3. **Scopes** - What data to request (email, profile, etc.)

### Per-Application Social Login

You can also configure social login on a per-application basis at:
```
/t/{tenantSlug}/portal/applications/{clientId}/social-login
```

This allows different OAuth clients within the same tenant to show different social login buttons.

---

## Setting Up Google Login

### 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Select **Web application**
6. Add authorized redirect URI:
   ```
   https://your-domain.com/t/{tenantSlug}/auth/social/google/callback
   ```
7. Copy the **Client ID** and **Client Secret**

### 2. Configure in LumoAuth

1. Go to `/t/{tenantSlug}/portal/configuration/social-login`
2. Click **Add Provider** → **Google**
3. Enter the Client ID and Client Secret
4. Save and **Enable**

---

## Setting Up GitHub Login

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set the authorization callback URL:
   ```
   https://your-domain.com/t/{tenantSlug}/auth/social/github/callback
   ```
4. Copy the **Client ID** and **Client Secret**

### 2. Configure in LumoAuth

1. Go to `/t/{tenantSlug}/portal/configuration/social-login`
2. Click **Add Provider** → **GitHub**
3. Enter credentials and save

---

## Setting Up Microsoft Login

### 1. Register in Azure AD

1. Go to the [Azure Portal](https://portal.azure.com) → **App registrations**
2. Click **New registration**
3. Add redirect URI:
   ```
   https://your-domain.com/t/{tenantSlug}/auth/social/microsoft/callback
   ```
4. Under **Certificates & secrets**, create a new client secret
5. Note the **Application (client) ID** and **Client Secret**

### 2. Configure in LumoAuth

1. Go to `/t/{tenantSlug}/portal/configuration/social-login`
2. Click **Add Provider** → **Microsoft**
3. Enter credentials and save

---

## Social Login URLs

Each social provider has tenant-specific authentication URLs:

```
Initiate:  /t/{tenantSlug}/auth/social/{provider}
Callback:  /t/{tenantSlug}/auth/social/{provider}/callback
```

Where `{provider}` is: `google`, `github`, `microsoft`, `facebook`, `apple`, `linkedin`

---

## User Experience

When social login is enabled, the login page displays:

1. **Social login buttons** - One button per enabled provider
2. **Email/password form** - Standard credential login (if enabled)
3. **Separator** - Visual "or" divider between social and credential login

Users who sign up via social login can later:
- Set a password (for email/password login as well)
- Link additional social accounts
- Remove linked social accounts (from the account settings page)

---

## Account Settings

Users can manage their linked social accounts at the account settings page:
```
/account/security
```

From here they can:
- View all linked social accounts
- Link new social providers
- Unlink social providers (if they have another login method)

---

## Just-In-Time (JIT) Provisioning

When a user authenticates via social login for the first time, LumoAuth automatically:

1. Creates a new user account in the tenant
2. Populates the user profile with data from the social provider
3. Links the social account to the new user
4. Optionally assigns default roles (configurable per tenant)

If a user with the same email already exists, the social account is linked to the existing user instead of creating a duplicate.

---

## Security Considerations

- **State parameter** - LumoAuth uses the OAuth `state` parameter to prevent CSRF attacks
- **PKCE** - When supported by the provider, PKCE is used for additional security
- **Token storage** - Social provider tokens are encrypted in the database
- **Scope minimization** - Only request the minimum scopes needed

---

## Related Guides

- [Authentication Overview](overview.md) - All authentication methods
- [Enterprise SSO](enterprise-sso.md) - SAML and OIDC for corporate IdPs
- [Multi-Factor Authentication](mfa.md) - Add MFA on top of social login
