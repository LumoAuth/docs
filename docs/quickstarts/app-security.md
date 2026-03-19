---
sidebar_label: Enable SSO, Auth & AuthZ for My App
---

# Enable SSO, Authentication & Authorization for Your App

Add login, SSO, and fine-grained access control to your application in minutes.

:::tip[Prerequisites]
- A LumoAuth tenant — [sign up at app.lumoauth.dev](https://app.lumoauth.dev)
- Your app's redirect URI (e.g. `https://myapp.com/auth/callback`)
:::

---

## Step 1: Register Your Application

In the [Tenant Portal](https://app.lumoauth.dev), go to **Applications → Create Application**.

| Field | Value |
|---|---|
| Name | Your app name |
| Type | `Web` (for server-side) or `SPA` (for React/Vue/Angular) |
| Redirect URI | `https://myapp.com/auth/callback` |

Save and copy your **Client ID** (and **Client Secret** for web apps).

---

## Step 2: Add a Login Button

### React / SPA

```bash
npm install @lumoauth/react
```

```tsx
import { LumoAuthProvider, SignIn, SignedIn, SignedOut, UserButton } from '@lumoauth/react';

// Wrap your app root
function App() {
  return (
    <LumoAuthProvider
      domain="https://app.lumoauth.dev"
      tenantSlug="YOUR_TENANT_SLUG"
      clientId="YOUR_CLIENT_ID"
    >
      <SignedIn>
        <UserButton showName />
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <SignIn afterSignInUrl="/dashboard" />
      </SignedOut>
    </LumoAuthProvider>
  );
}
```

### Node.js / Express

```bash
npm install @lumoauth/node
```

```javascript
const { LumoAuth } = require('@lumoauth/node');

const auth = new LumoAuth({
  tenantSlug: 'YOUR_TENANT_SLUG',
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET',
  redirectUri: 'https://myapp.com/auth/callback',
});

// Redirect user to login
app.get('/login', (req, res) => {
  res.redirect(auth.getAuthorizationUrl({ scope: 'openid profile email' }));
});

// Handle callback
app.get('/auth/callback', async (req, res) => {
  const tokens = await auth.exchangeCode(req.query.code);
  req.session.user = await auth.getUserInfo(tokens.access_token);
  res.redirect('/dashboard');
});
```

### Python (FastAPI / Flask)

```bash
pip install lumoauth
```

```python
from lumoauth import LumoAuth

auth = LumoAuth(
    tenant_slug="YOUR_TENANT_SLUG",
    client_id="YOUR_CLIENT_ID",
    client_secret="YOUR_CLIENT_SECRET",
    redirect_uri="https://myapp.com/auth/callback",
)

# Redirect to login
@app.get("/login")
def login():
    return RedirectResponse(auth.get_authorization_url(scope="openid profile email"))

# Handle callback
@app.get("/auth/callback")
async def callback(code: str):
    tokens = await auth.exchange_code(code)
    user = await auth.get_user_info(tokens["access_token"])
    # Store user in session
    return RedirectResponse("/dashboard")
```

---

## Step 3: Enable Enterprise SSO (Optional)

Enable SAML or OIDC SSO so users can log in with their corporate identity.

In the portal: **Configuration → Enterprise SSO → Add Provider**

- **SAML 2.0**: Paste your IdP metadata URL or XML
- **OIDC**: Enter your IdP's discovery URL, client ID, and secret

Your login page automatically shows the SSO option — no code changes required.

---

## Step 4: Protect Routes with Permissions

Define roles and permissions in the portal under **Access Management → Roles**.

Then check permissions in your app:

```bash
curl -X POST https://app.lumoauth.dev/t/YOUR_TENANT_SLUG/api/v1/authz/check \
  -H "Authorization: Bearer USER_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permission": "billing.manage"}'
```

```json
{ "allowed": true }
```

In React, use the `Protect` component:

```tsx
import { Protect } from '@lumoauth/react';

<Protect permission="billing.manage" fallback={<p>Access denied</p>}>
  <BillingDashboard />
</Protect>
```

---

## What's Next

| Topic | Description |
|---|---|
| [OAuth 2.0 & OIDC](/oauth) | Deep-dive into token flows |
| [Access Control](/user-guide/access-control/overview) | RBAC, ABAC, Zanzibar ReBAC |
| [Enterprise SSO](/user-guide/authentication/enterprise-sso) | SAML and OIDC federation |
| [Multi-Tenancy](/user-guide/multi-tenancy/overview) | Isolate customers in your SaaS |
| [React Quickstart](/quickstarts/react) | Full React integration guide |
| [Node.js Quickstart](/quickstarts/node) | Full Node.js integration guide |
