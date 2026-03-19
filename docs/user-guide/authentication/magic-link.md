---
sidebar_label: Magic Link & Email-First
---

# Magic Link & Email-First Login

Passwordless authentication via magic links lets users sign in with a single click — no password required. LumoAuth also supports an **email-first** login flow where the user enters their email address first, and the UI adapts to show the most appropriate next step (password field, magic link, or sign-up prompt) based on whether an account already exists.

---

## Magic Link Authentication

### How It Works

1. **User enters their email** on the login page
2. **LumoAuth emails a secure, time-limited link** to that address
3. **User clicks the link** — they are authenticated and redirected to your app
4. **Link is invalidated** after first use

The email is never required to be registered: the server always responds with "check your inbox" regardless of whether the address exists, preventing user enumeration attacks.

---

### Enabling Magic Link

Configure magic link authentication in the tenant auth settings:

```
/t/{tenantSlug}/portal/configuration/auth-settings
```

| Setting | Description |
|---------|-------------|
| **Enable Magic Link** | Allow users to request a sign-in link instead of entering a password |
| **Magic Link Only** | Disable password login entirely — users must always use a magic link |
| **Link Expiry** | How long the link is valid (default: 15 minutes) |
| **Redirect After Login** | Where users land after clicking the link |

:::info Magic Link Only mode
When **Magic Link Only** is enabled, the password field is hidden on the login page. This is mutually exclusive with password authentication — you cannot enable both simultaneously for the same tenant.
:::

---

### Login Page Behaviour

When magic link is enabled, the login page shows a **"Send me a sign-in link"** button alongside (or instead of) the password field. After the user submits their email:

- They are redirected to a **"Check your inbox"** confirmation page
- The page shows the email address that was used and a hint to check spam
- A **"Try a different email"** link lets them start over

---

### Security Considerations

| Concern | Mitigation |
|---------|-----------|
| Link interception | Links are single-use and expire after a configurable period |
| User enumeration | The server always responds with success, whether or not the email is registered |
| Replay attacks | Tokens are invalidated immediately after first use |
| Phishing | Links contain a cryptographically random token — no credentials are transmitted |
| Email delivery delay | Token expiry is configurable to account for delayed delivery |

---

## Email-First Login Flow

The email-first flow presents a single email input as the first step of login. After the user submits their email, LumoAuth checks whether an account exists and renders the appropriate next step:

```
[Email input] → account found?
   ├─ Yes → show password field / magic link option
   └─ No  → show "no account found" message or sign-up prompt
```

This pattern is common in consumer apps (popular with Clerk, Auth0, and similar platforms) and reduces cognitive load by showing only relevant options.

### Enabling Email-First

Enable **Email-First Login** in auth settings:

```
/t/{tenantSlug}/portal/configuration/auth-settings
```

When enabled, the login page shows only an email field initially. The next step is shown after the email is submitted.

---

## Tenant Configuration Reference

| Setting | Default | Description |
|---------|---------|-------------|
| `magic_link_enabled` | `false` | Enable magic link sign-in |
| `magic_link_only` | `false` | Disable passwords; magic link is the only option |
| `email_first` | `false` | Show email input before password/magic-link step |
| `magic_link_expiry` | `900` | Token lifetime in seconds (15 minutes) |

---

## Email Templates

Customize the magic link email at:

```
/t/{tenantSlug}/portal/configuration/email-templates
```

The **Magic Link** email template supports the following variables:

| Variable | Description |
|----------|-------------|
| `{{ magic_link_url }}` | The sign-in link (required) |
| `{{ tenant_name }}` | Your tenant's display name |
| `{{ user_email }}` | The recipient's email address |
| `{{ expires_in }}` | Human-readable expiry (e.g. "15 minutes") |

---

## Server Endpoints

These endpoints are called by LumoAuth's login page. You can also call them directly when building a custom login UI using the SDK.

### Request a Magic Link

```http
POST /t/{tenantSlug}/magic-link
Content-Type: application/x-www-form-urlencoded

email=user%40example.com&_target_path=%2Fdashboard
```

| Parameter | Required | Description |
|-----------|----------|-------------|
| `email` | Yes | The user's email address |
| `_target_path` | No | Path to redirect to after login (e.g. `/dashboard`) |

**Response:** An HTML confirmation page is returned. The server always responds with HTTP 200 regardless of whether the email is registered.

---

### Check Email Existence

Used by email-first flows to decide what to show after the user submits their email.

```http
POST /t/{tenantSlug}/check-email
Content-Type: application/x-www-form-urlencoded

email=user%40example.com
```

**Response:**

```json
{ "exists": true }
```

| Field | Type | Description |
|-------|------|-------------|
| `exists` | `boolean` | Whether an account with this email exists in the tenant |

:::caution
Only use this endpoint from your own UI components that are already authenticated or rate-limited. Unrestricted use could allow enumeration of registered emails. LumoAuth rate-limits this endpoint automatically.
:::

---

## SDK Integration

### TypeScript / JavaScript

Use the `AuthModule` from `@lumoauth/sdk` to send magic links and implement email-first flows in custom UIs:

```typescript
import { AuthModule } from '@lumoauth/sdk';

const auth = new AuthModule({
  baseUrl: 'https://app.lumoauth.dev',
  tenantSlug: 'acme-corp',
  clientId: 'your-client-id',
});

// Send a magic link
await auth.requestMagicLink({ email: 'user@example.com' });

// Optional: redirect the user to a specific page after clicking the link
await auth.requestMagicLink({
  email: 'user@example.com',
  redirectUri: 'https://myapp.com/dashboard',
});

// Email-first: check if an account exists before showing the next step
const { exists } = await auth.checkEmailExists('user@example.com');
if (exists) {
  // Show password field or magic-link button
} else {
  // Show "no account found" or redirect to sign-up
}
```

### React SDK

The `@lumoauth/react` SDK provides purpose-built hooks for both flows:

#### `useMagicLink()`

Manages loading/sent/error state for the magic link form:

```tsx
import { useMagicLink } from '@lumoauth/react';

function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const { sendMagicLink, isLoading, isSent, error, reset } = useMagicLink();

  if (isSent) {
    return (
      <div>
        <p>Check your inbox — we sent a sign-in link to <strong>{email}</strong>.</p>
        <button onClick={reset}>Use a different email</button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); sendMagicLink(email); }}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending…' : 'Send sign-in link'}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
```

#### `useEmailFirst()`

Implements the email-first check step:

```tsx
import { useEmailFirst } from '@lumoauth/react';

function EmailStep({
  onKnownUser,
  onNewUser,
}: {
  onKnownUser: (email: string) => void;
  onNewUser: (email: string) => void;
}) {
  const [email, setEmail] = useState('');
  const { checkEmail, isLoading } = useEmailFirst();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const exists = await checkEmail(email);
    if (exists) {
      onKnownUser(email);
    } else {
      onNewUser(email);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Checking…' : 'Continue'}
      </button>
    </form>
  );
}
```

---

## Related Guides

- [Email & Password Authentication](email-password.md) — Traditional credential-based login
- [Social Login](social-login.md) — OAuth-based login via external providers
- [Multi-Factor Authentication](mfa.md) — Add a second factor to any login method
- [SDKs & Libraries](../../developer/sdks.md) — TypeScript, React, and Python SDK reference
