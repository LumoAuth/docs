# SDKs & Libraries

LumoAuth provides official SDKs for JavaScript/TypeScript, React, and Python. All SDKs are designed to work with LumoAuth's multi-tenant architecture out of the box.

---

## JavaScript / TypeScript SDK

**`@lumoauth/sdk`** - Core SDK for Node.js and browser environments.

```bash
npm install @lumoauth/sdk
```

### Initialize the Client

```typescript
import { LumoAuth } from '@lumoauth/sdk';

const lumo = new LumoAuth({
  baseUrl: 'https://app.lumoauth.dev',
  tenantSlug: 'acme-corp',
  clientId: 'your-client-id',
  authStrategy: 'pkce', // default
});
```

### PKCE Authentication

```typescript
// Generate authorization URL
const { url, codeVerifier, state } = lumo.auth.buildAuthorizationUrl({
  redirectUri: 'https://myapp.com/callback',
  scope: 'openid profile email',
});

// Redirect user to `url`, then exchange the code on callback
const tokens = await lumo.auth.exchangeCodeForTokens({
  code: authorizationCode,
  codeVerifier,
  redirectUri: 'https://myapp.com/callback',
});
// tokens.access_token, tokens.id_token, tokens.refresh_token
```

### Permission Checks (RBAC)

```typescript
const allowed = await lumo.permissions.check('documents.edit');
// true | false

const bulk = await lumo.permissions.checkBulk([
  'documents.edit',
  'documents.delete',
  'users.invite',
]);
// { results: { 'documents.edit': true, 'documents.delete': false, 'users.invite': true } }
```

### Zanzibar (ReBAC)

```typescript
const canView = await lumo.zanzibar.check({
  object: 'document:report-q4',
  relation: 'viewer',
  subject: 'user:jane',
});

// Convenience helpers
const isOwner = await lumo.zanzibar.isOwner('document:report-q4', 'user:jane');
const isEditor = await lumo.zanzibar.isEditor('project:alpha', 'user:bob');
```

### ABAC Policy Evaluation

```typescript
const result = await lumo.abac.isAllowed('document', 'edit', 'doc-123');
// true | false

const detailed = await lumo.abac.check({
  resourceType: 'document',
  action: 'edit',
  resourceId: 'doc-123',
  context: { ip: '203.0.113.1' },
});
// { allowed: true, reason: '...', matchedPolicies: [...] }
```

### Error Handling

```typescript
import { LumoAuthApiError, LumoAuthAuthError } from '@lumoauth/sdk';

try {
  await lumo.permissions.check('admin.access');
} catch (err) {
  if (err instanceof LumoAuthAuthError) {
    // 401 - token expired or invalid
  } else if (err instanceof LumoAuthApiError) {
    // Other API error (4xx/5xx)
    console.error(err.status, err.message);
  }
}
```

---

## React SDK

**`@lumoauth/react`** - Pre-built components and hooks for React 18+.

```bash
npm install @lumoauth/react
```

### Provider Setup

Wrap your app with `LumoAuthProvider`:

```tsx
import { LumoAuthProvider } from '@lumoauth/react';

function App() {
  return (
    <LumoAuthProvider
      domain="https://app.lumoauth.dev"
      tenantSlug="acme-corp"
      clientId="your-client-id"
    >
      <MyApp />
    </LumoAuthProvider>
  );
}
```

### Authentication Components

```tsx
import { SignIn, SignUp, AuthCallback, UserButton } from '@lumoauth/react';

// Sign-in page
<SignIn afterSignInUrl="/dashboard" />

// Sign-up page
<SignUp afterSignUpUrl="/onboarding" />

// OAuth callback handler
<AuthCallback afterSignInUrl="/dashboard" />

// User menu dropdown (avatar + sign out)
<UserButton showName />
```

### Conditional Rendering

```tsx
import { SignedIn, SignedOut, RedirectToSignIn } from '@lumoauth/react';

function Layout() {
  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
```

### Authorization with Protect

```tsx
import { Protect } from '@lumoauth/react';

// RBAC
<Protect permission="billing.manage" fallback={<p>No access</p>}>
  <BillingDashboard />
</Protect>

// Zanzibar
<Protect zanzibar={{ object: 'project:alpha', relation: 'editor' }}>
  <ProjectEditor />
</Protect>

// ABAC
<Protect abac={{ resourceType: 'document', action: 'edit', resourceId: 'doc-123' }}>
  <DocumentEditor />
</Protect>
```

### Hooks

```tsx
import {
  useAuth,
  useUser,
  usePermission,
  useZanzibar,
  useAbac,
  useLumoAuth,
} from '@lumoauth/react';

function Dashboard() {
  const { isSignedIn, signOut, getToken } = useAuth();
  const user = useUser();
  const { allowed: canEdit } = usePermission('documents.edit');
  const { allowed: isViewer } = useZanzibar({
    object: 'project:alpha',
    relation: 'viewer',
  });

  if (!isSignedIn) return null;

  return (
    <div>
      <p>Welcome, {user.displayName}</p>
      {canEdit && <EditButton />}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Theming

```tsx
<LumoAuthProvider
  domain="https://app.lumoauth.dev"
  tenantSlug="acme-corp"
  clientId="your-client-id"
>
  <SignIn appearance={{ theme: 'dark', className: 'my-signin' }} />
</LumoAuthProvider>
```

---

## Python SDK

**`lumoauth`** - Python SDK for server-side applications and AI agents.

```bash
pip install lumoauth
```

### Agent Authentication

```python
from lumoauth import LumoAuthAgent

agent = LumoAuthAgent(
    base_url="https://app.lumoauth.dev",
    tenant="acme-corp",
    client_id="your-agent-client-id",
    client_secret="your-agent-client-secret",
)

agent.authenticate(scopes=["read:users", "write:documents"])
```

Environment variables are also supported (`LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, `AGENT_CLIENT_SECRET`).

### The Ask API

Lightweight preflight checks optimized for LLM tool-calling workflows:

```python
result = agent.ask("read_document", context={"document_id": "doc-123"})
# { 'allowed': True, 'action': 'read_document', 'reason': '...', 'audit_id': '...' }

if agent.is_allowed("delete_user", context={"user_id": "u-456"}):
    # proceed with action
    pass
```

### Agent Identity

```python
info = agent.get_agent_info()
# { 'id': ..., 'capabilities': [...], 'budget_policy': {...} }

if agent.has_capability("web_search"):
    # agent is authorized for web search
    pass

budget = agent.get_budget_status()
if agent.is_budget_exhausted():
    print("Daily token budget reached")
```

### Delegation Chains (RFC 8693)

Act on behalf of users with token exchange:

```python
from lumoauth import DelegationChain

chain = DelegationChain(agent, redirect_uri="https://myapp.com/consent")

# Get user consent
consent_url = chain.get_consent_url("session-1", scopes=["profile", "documents"])
# Redirect user to consent_url...

# After consent callback
chain.handle_consent_callback("session-1", authorization_code)

# Exchange for delegated token
delegated_token = chain.exchange("session-1", scopes=["read:documents"])

# Make requests on behalf of the user
response = chain.request("session-1", "GET", "/api/v1/documents")
```

### MCP Token Exchange

```python
mcp_token = agent.get_mcp_token("my-mcp-server")
# Use mcp_token to authenticate with the MCP server
```

### Cryptographic Agent Identity (AAuth)

For agents that need cryptographic identity with HTTP message signing:

```bash
pip install lumoauth[aauth]
```

```python
from lumoauth import AAuthClient

# Generate a keypair
private_pem, jwks = AAuthClient.generate_keypair()

client = AAuthClient(
    agent_identifier="https://myagent.example.com",
    private_key_pem=private_pem,
    base_url="https://app.lumoauth.dev",
    tenant="acme-corp",
)

# Sign HTTP requests (RFC 9421)
headers = client.sign_request("POST", "https://api.example.com/data", body=b'{"key":"value"}')
```

---

## OIDC Discovery

All SDKs work with LumoAuth's standard OIDC discovery endpoint. Any third-party OAuth 2.0 / OIDC library can also integrate by pointing to:

```
https://app.lumoauth.dev/t/{tenantSlug}/api/v1/.well-known/openid-configuration
```

## Framework Quickstarts

Get started with a complete integration guide for your stack:

- [React Quickstart](/quickstarts/react) - React SPA with authentication, user components, and access control
- [Node.js / Express Quickstart](/quickstarts/node) - Express API with token validation and permission checks
- [Python Quickstart](/quickstarts/python) - Python backend with agent authentication and the Ask API