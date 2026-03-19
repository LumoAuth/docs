# Email Templates

LumoAuth sends transactional emails for authentication events, invitations, and security notifications. Customize these templates to match your brand and messaging.

---

## Managing Templates

Navigate to `/t/{tenantSlug}/portal/configuration/email-templates` to view and edit all email templates.

---

## Available Templates

| Template | Trigger | Description |
|----------|---------|-------------|
| **Welcome** | User registration | Welcome message for new users |
| **Email Verification** | Registration / email change | Link to verify email address |
| **Password Reset** | Password reset request | Link to reset password |
| **Invitation** | Admin invites a user | Link to accept invitation and create account |
| **MFA Code** | Email MFA challenge | One-time code for email-based MFA |
| **Account Locked** | Brute force detection | Notification that account was locked |
| **Login from New Device** | New device detection | Alert about login from unrecognized device |
| **Password Changed** | Password change | Confirmation of password change |
| **Suspicious Activity** | High risk event | Alert about unusual login activity |

---

## Customization Options

### Content

Each template supports:

| Element | Description |
|---------|-------------|
| **Subject** | Email subject line |
| **Body (HTML)** | Rich HTML email content |
| **Body (Text)** | Plain text fallback |

### Template Variables

Use variables in your templates to insert dynamic content:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{ user.firstName }}` | User's first name | `Alice` |
| `{{ user.lastName }}` | User's last name | `Smith` |
| `{{ user.email }}` | User's email | `alice@acme.com` |
| `{{ tenant.name }}` | Tenant display name | `Acme Corporation` |
| `{{ action_url }}` | Action link (verify, reset, etc.) | `https://...` |
| `{{ code }}` | One-time code (for MFA) | `123456` |
| `{{ expiration }}` | Link expiration time | `24 hours` |
| `{{ ip_address }}` | Requesting IP | `192.168.1.100` |
| `{{ device }}` | Device information | `Chrome on macOS` |
| `{{ location }}` | Approximate location | `New York, US` |

### Branding

| Setting | Description |
|---------|-------------|
| **Logo** | Your company logo displayed in the email header |
| **Primary Color** | Button and accent colors |
| **Footer** | Custom footer text (company name, address, unsubscribe) |

---

## Example: Custom Verification Email

```html
<h1>Welcome to {{ tenant.name }}!</h1>

<p>Hi {{ user.firstName }},</p>

<p>Please verify your email address to complete your registration.</p>

<a href="{{ action_url }}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
  Verify Email
</a>

<p>This link expires in {{ expiration }}.</p>

<p>If you didn't create this account, you can safely ignore this email.</p>
```

---

## Email Delivery

LumoAuth handles email delivery and supports:

| Feature | Description |
|---------|-------------|
| **SMTP** | Configure a custom SMTP server |
| **Rate limiting** | Prevent email flooding |
| **Delivery tracking** | Monitor send success/failure |

Configure email delivery settings at `/t/{tenantSlug}/portal/configuration/email-templates`.

---

## Related Guides

- [User Invitations](../user-management/invitations.md) - Invite users with custom emails
- [MFA](../authentication/mfa.md) - Email-based MFA codes
- [Account Self-Service](../user-management/account-self-service.md) - Password reset and verification flows
