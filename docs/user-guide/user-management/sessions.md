# Sessions

LumoAuth manages user sessions to control how long users stay authenticated and tracks active sessions for security visibility.

---

## Session Types

| Type | Description | Stored |
|------|-------------|--------|
| **Login Session** | Server-side session after user authenticates | Server (cookie-based) |
| **Access Token** | Short-lived JWT for API access | Client-side |
| **Refresh Token** | Long-lived token to obtain new access tokens | Server + Client |
| **Remember Me** | Extended session for returning users | Server (cookie-based) |

---

## Session Configuration

Configure session settings at `/t/{tenantSlug}/portal/configuration/auth-settings`:

| Setting | Description | Default |
|---------|-------------|---------|
| **Session Lifetime** | Duration of login sessions | 24 hours |
| **Access Token Lifetime** | JWT access token validity | 1 hour |
| **Refresh Token Lifetime** | Refresh token validity | 30 days |
| **Idle Timeout** | Session expires after inactivity | 30 minutes |
| **Remember Me Duration** | Extended session for "remember me" | 30 days |
| **Concurrent Sessions** | Max simultaneous sessions per user | Unlimited |

---

## Viewing Active Sessions

### As an Admin

1. Go to `/t/{tenantSlug}/portal/access-management/users`
2. Select a user
3. View the **Sessions** tab to see:
   - Active sessions with IP, device, and location
   - Last activity timestamp
   - Session creation time

### As a User

Users can view their active sessions in the self-service account page and revoke sessions they don't recognize.

---

## Revoking Sessions

### Revoke a Single Session

Admins can revoke individual sessions from the user detail page.

### Revoke All User Sessions

Force a user to re-authenticate by revoking all their sessions:

```bash
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/users/{userId}/sessions/revoke-all \
  -H "Authorization: Bearer {admin_token}"
```

### Token Revocation

Revoke specific tokens:

```bash
# Revoke a refresh token
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/oauth/revoke \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token={refresh_token}&client_id={client_id}&client_secret={client_secret}"
```

---

## Session Security

| Feature | Description |
|---------|-------------|
| **Session fixation protection** | Sessions are regenerated after login |
| **Secure cookies** | Session cookies use `Secure`, `HttpOnly`, `SameSite` flags |
| **IP binding** (optional) | Sessions can be bound to the originating IP |
| **Concurrent session limits** | Limit how many devices a user can be logged into |
| **Forced re-authentication** | Require re-auth for sensitive operations |

---

## Related Guides

- [User Management Overview](overview.md) - Full user lifecycle
- [Audit Logs](../compliance/audit-logs.md) - Track session events
- [Adaptive MFA](../authentication/adaptive-mfa.md) - Risk-based session controls
