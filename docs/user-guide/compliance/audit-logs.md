# Audit Logs

LumoAuth records a comprehensive audit trail of all authentication events, administrative actions, and data changes within each tenant. Audit logs are essential for security monitoring, compliance, and incident investigation.

---

## Viewing Audit Logs

### Portal

Navigate to `/t/{tenantSlug}/portal/audit-logs`:

- **Search** - Filter by event type, user, date range, IP address
- **Event Detail** - View full event context including request metadata
- **Export** - Download logs in CSV or JSON format

---

## Event Categories

### Authentication Events

| Event | Description |
|-------|-------------|
| `auth.login.success` | User successfully authenticated |
| `auth.login.failure` | Failed login attempt |
| `auth.logout` | User logged out |
| `auth.password_reset.request` | Password reset requested |
| `auth.password_reset.complete` | Password reset completed |
| `auth.mfa.challenge` | MFA challenge presented |
| `auth.mfa.success` | MFA verification succeeded |
| `auth.mfa.failure` | MFA verification failed |
| `auth.social.login` | Social login authentication |
| `auth.saml.login` | SAML SSO authentication |
| `auth.passkey.login` | Passkey authentication |
| `auth.device.authorize` | Device flow authorization |

### User Management Events

| Event | Description |
|-------|-------------|
| `user.created` | New user account created |
| `user.updated` | User profile modified |
| `user.deleted` | User account deleted |
| `user.suspended` | User account suspended |
| `user.activated` | User account activated |
| `user.invited` | User invitation sent |
| `user.role.assigned` | Role assigned to user |
| `user.role.removed` | Role removed from user |
| `user.group.added` | User added to group |
| `user.group.removed` | User removed from group |

### Application Events

| Event | Description |
|-------|-------------|
| `app.created` | OAuth application created |
| `app.updated` | Application settings modified |
| `app.deleted` | Application deleted |
| `app.secret.rotated` | Client secret rotated |
| `token.issued` | Access token issued |
| `token.revoked` | Token revoked |

### Administrative Events

| Event | Description |
|-------|-------------|
| `role.created` | Role defined |
| `role.updated` | Role modified |
| `role.deleted` | Role deleted |
| `permission.created` | Permission defined |
| `group.created` | Group created |
| `config.updated` | Tenant configuration changed |
| `webhook.created` | Webhook registered |
| `signing_key.rotated` | Signing key rotated |

### Compliance Events

| Event | Description |
|-------|-------------|
| `gdpr.export.requested` | Data export requested |
| `gdpr.export.completed` | Data export generated |
| `gdpr.delete.requested` | Data deletion requested |
| `gdpr.delete.completed` | Data deletion processed |

### Security Events

| Event | Description |
|-------|-------------|
| `security.brute_force.detected` | Brute force attempt detected |
| `security.impossible_travel` | Impossible travel detected |
| `security.risk.high` | High risk score triggered |
| `security.account.lockout` | Account locked due to failed attempts |

---

## Log Entry Structure

Each audit log entry contains:

| Field | Description | Example |
|-------|-------------|---------|
| **Timestamp** | When the event occurred | `2025-02-01T14:30:00Z` |
| **Event Type** | Event identifier | `auth.login.success` |
| **Actor** | User or system that triggered the event | `alice@acme.com` |
| **Target** | Resource affected | `user:bob-uuid` |
| **IP Address** | Source IP | `192.168.1.100` |
| **User Agent** | Browser/client info | `Mozilla/5.0...` |
| **Geolocation** | Approximate location | `New York, US` |
| **Details** | Additional context | `{"method": "passkey"}` |
| **Result** | Success or failure | `success` |

---

## Querying via API

```bash
# Get recent audit logs
curl https://your-domain.com/t/{tenantSlug}/api/v1/audit-logs \
  -H "Authorization: Bearer {admin_token}"

# Filter by event type
curl "https://your-domain.com/t/{tenantSlug}/api/v1/audit-logs?event_type=auth.login.failure" \
  -H "Authorization: Bearer {admin_token}"

# Filter by user and date range
curl "https://your-domain.com/t/{tenantSlug}/api/v1/audit-logs?actor=alice@acme.com&from=2025-01-01&to=2025-02-01" \
  -H "Authorization: Bearer {admin_token}"
```

---

## Log Retention

| Setting | Default | Configurable |
|---------|---------|--------------|
| **Retention Period** | 90 days | Yes |
| **Export Before Deletion** | Automatic export available | Yes |

Configure retention at `/t/{tenantSlug}/portal/configuration/auth-settings`.

---

## Related Guides

- [GDPR Compliance](gdpr.md) - Data subject requests and privacy
- [Adaptive MFA](../authentication/adaptive-mfa.md) - Security events and risk scoring
- [Webhooks](../integrations/webhooks.md) - Real-time event notifications
