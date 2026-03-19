# Email & Password Authentication

The most common authentication method. Users register with an email address and password, then log in with those credentials.

---

## How It Works

1. **Registration** - User provides email, name, and password
2. **Email Verification** - LumoAuth sends a verification email with a unique link
3. **Login** - User enters email and password
4. **MFA (if configured)** - Second factor challenge
5. **Session Created** - User receives tokens and a session cookie

---

## Configuration

Navigate to **Configuration** → **Auth Settings** at:
```
/t/{tenantSlug}/portal/configuration/auth-settings
```

### Enable Registration

Toggle **Allow Registration** to let users self-register. When disabled, users can only be created by admins or through invitations.

### Email Verification

Toggle **Require Email Verification** to prevent unverified users from logging in. When enabled:

- A verification email is sent immediately after registration
- Users cannot authenticate until they click the verification link
- Verification tokens expire after a configurable period
- Users can request a new verification email

### Password Policy

Configure password requirements:

| Setting | Description | Recommended |
|---------|-------------|-------------|
| **Minimum Length** | Minimum number of characters | 12+ |
| **Require Uppercase** | At least one uppercase letter | Yes |
| **Require Lowercase** | At least one lowercase letter | Yes |
| **Require Numbers** | At least one digit | Yes |
| **Require Special Characters** | At least one symbol | Optional |

Passwords are hashed using **bcrypt** before storage - plain text passwords are never stored.

---

## User Registration Flow

### Self-Registration

Users can register at the default registration page:
```
/register
```

The registration form collects:
- Email address
- Full name
- Password (validated against password policy)

After registration:
1. An email verification link is sent
2. The user is redirected to a "check your email" page
3. Clicking the verification link activates the account

### Admin-Created Users

Admins can create users directly at:
```
/t/{tenantSlug}/portal/access-management/users/create
```

Admin-created users can optionally:
- Have a pre-set password
- Skip email verification
- Be assigned roles immediately

### Invited Users

Invite users via email at:
```
/t/{tenantSlug}/portal/access-management/invite-users
```

Invitation flow:
1. Admin enters email addresses and selects roles
2. Invitation emails are sent with unique registration links
3. Invited users complete registration (setting their password)
4. Pre-assigned roles are automatically applied

---

## Login Flow

The login page is presented at:
```
/login
```

Or within an OAuth flow:
```
/t/{tenantSlug}/api/v1/oauth/authorize?...
```

### Login Process

1. User enters email and password
2. LumoAuth validates credentials against stored bcrypt hash
3. If MFA is enabled → redirect to MFA challenge
4. If adaptive auth is enabled → risk score is calculated
   - Low risk → login succeeds
   - Medium risk → MFA challenge triggered
   - High risk → login blocked
5. On success → authorization code or session issued

### Failed Login Handling

- Failed attempts are logged in the audit trail
- After configurable failed attempts, the account may be temporarily locked
- IP-based rate limiting prevents brute-force attacks
- Notifications can be sent to users about suspicious login attempts

---

## Password Reset

Users can reset their password at:
```
/auth/forgot-password
```

### Reset Flow

1. User enters their email address
2. LumoAuth sends a password reset email with a secure, time-limited token
3. User clicks the link and sets a new password
4. All active sessions are optionally invalidated

### Security Measures

- Reset tokens expire after a configurable period
- Tokens are single-use
- The reset link includes a cryptographically secure random token
- Rate limiting prevents abuse

---

## Email Templates

Customize the emails sent during authentication at:
```
/t/{tenantSlug}/portal/configuration/email-templates
```

Available templates:

| Template | Sent When |
|----------|-----------|
| **Welcome** | User registers successfully |
| **Email Verification** | Account needs email verification |
| **Password Reset** | User requests a password reset |
| **MFA Setup** | MFA is enrolled for the first time |
| **Login Alert** | Suspicious login detected (adaptive auth) |

---

## Related Guides

- [Multi-Factor Authentication](mfa.md) - Add a second factor to email/password login
- [Adaptive MFA](adaptive-mfa.md) - Risk-based MFA enforcement
- [Social Login](social-login.md) - Add social login buttons alongside email/password
