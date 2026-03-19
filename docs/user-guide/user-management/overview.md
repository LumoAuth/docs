# User Management

LumoAuth provides comprehensive user management capabilities within each tenant. Users can be created, invited, managed, and deprovisioned through the tenant portal or API.

---

## User Lifecycle

```
Invited / Registered → Email Verified → Active → Suspended / Deleted
```

| State | Description |
|-------|-------------|
| **Pending** | User created but email not verified |
| **Active** | Email verified, can authenticate |
| **Suspended** | Temporarily disabled, cannot authenticate |
| **Deleted** | Account removed (subject to GDPR retention) |

---

## Managing Users

### Portal

Navigate to `/t/{tenantSlug}/portal/access-management/users`:

- **User List** - Search, filter, and browse all tenant users
- **User Detail** - View profile, roles, groups, sessions, MFA methods, audit log
- **Create User** - Manually create a user account
- **Edit User** - Update profile fields, reset password, manage MFA
- **Suspend / Delete** - Disable or remove a user

### User Profile Fields

| Field | Description | Editable |
|-------|-------------|----------|
| **Email** | Primary identifier | Yes |
| **First Name** | Given name | Yes |
| **Last Name** | Family name | Yes |
| **Phone** | Phone number (used for SMS MFA) | Yes |
| **Email Verified** | Verification status | Admin only |
| **MFA Enabled** | Whether MFA is active | Admin can reset |
| **Roles** | Assigned roles | Admin only |
| **Groups** | Group memberships | Admin only |
| **Created At** | Account creation timestamp | No |
| **Last Login** | Most recent authentication | No |

---

## Creating Users

### Manual Creation

1. Go to `/t/{tenantSlug}/portal/access-management/users`
2. Click **Create User**
3. Enter email, name, and optionally set a temporary password
4. Optionally assign roles and groups
5. Choose whether to send a welcome email

### Self-Registration

If self-registration is enabled in auth settings (`/t/{tenantSlug}/portal/configuration/auth-settings`), users can register at the tenant login page.

### SCIM Provisioning

Users can be provisioned automatically from external identity providers using [SCIM 2.0](../integrations/scim.md).

### JIT Provisioning

When a user authenticates via [Social Login](../authentication/social-login.md), [SAML](../authentication/enterprise-sso.md), or [OIDC Federation](../authentication/enterprise-sso.md) for the first time, their account is automatically created (just-in-time provisioning).

---

## In This Section

| Guide | Description |
|-------|-------------|
| [Invitations](invitations.md) | Invite users to join your tenant |
| [Sessions](sessions.md) | Manage user sessions and tokens |
| [Account Self-Service](account-self-service.md) | Password reset, profile updates, MFA enrollment |
