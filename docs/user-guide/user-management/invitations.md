# User Invitations

Invite users to join your tenant via email. Invitation-based onboarding ensures only authorized users can create accounts.

---

## Sending Invitations

### Via Portal

1. Go to `/t/{tenantSlug}/portal/access-management/users`
2. Click **Invite User**
3. Enter:
   - **Email address** - Recipient's email
   - **Roles** (optional) - Pre-assign roles to the invited user
   - **Groups** (optional) - Pre-assign group memberships
4. Click **Send Invitation**

The user receives an email with a link to complete registration.

### Via API

```bash
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/invitations \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "roles": ["editor"],
    "groups": ["engineering"]
  }'
```

### Bulk Invitations

Invite multiple users at once:

```bash
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/invitations/bulk \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "invitations": [
      {"email": "alice@example.com", "roles": ["editor"]},
      {"email": "bob@example.com", "roles": ["viewer"]},
      {"email": "carol@example.com", "roles": ["admin"]}
    ]
  }'
```

---

## Invitation Flow

```
Admin sends invitation
       │
       ▼
User receives email with link
       │
       ▼
User clicks link → Registration page
       │
       ▼
User sets password and completes profile
       │
       ▼
Account created with pre-assigned roles/groups
       │
       ▼
User can log in immediately
```

---

## Invitation Settings

| Setting | Description | Default |
|---------|-------------|---------|
| **Expiration** | How long the invitation link is valid | 7 days |
| **Registration Mode** | `invitation-only` or `open` | Open |

Configure at `/t/{tenantSlug}/portal/configuration/auth-settings`.

When registration mode is set to **invitation-only**, users cannot self-register - they must receive an invitation.

---

## Managing Invitations

| Action | Description |
|--------|-------------|
| **View Pending** | See all outstanding invitations |
| **Resend** | Send the invitation email again |
| **Revoke** | Cancel a pending invitation |

---

## Customizing Invitation Emails

Customize the invitation email template at `/t/{tenantSlug}/portal/configuration/email-templates`:

- Subject line
- Body content
- Branding (logo, colors)
- Custom message from the admin

See [Email Templates](../integrations/email-templates.md) for details.

---

## Related Guides

- [User Management Overview](overview.md) - Full user lifecycle
- [Account Self-Service](account-self-service.md) - User-initiated actions
- [Email Templates](../integrations/email-templates.md) - Customize email content
