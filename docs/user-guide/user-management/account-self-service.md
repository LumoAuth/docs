# Account Self-Service

LumoAuth allows users to manage their own accounts without admin intervention - updating profiles, resetting passwords, enrolling in MFA, and managing sessions.

---

## Self-Service Features

| Feature | Description | URL |
|---------|-------------|-----|
| **Profile Update** | Edit name, email, phone | `/t/{tenantSlug}/account/profile` |
| **Password Change** | Change current password | `/t/{tenantSlug}/account/password` |
| **Password Reset** | Reset via email link | `/t/{tenantSlug}/forgot-password` |
| **MFA Enrollment** | Set up TOTP, SMS, or email MFA | `/t/{tenantSlug}/account/mfa` |
| **Passkey Management** | Register or remove passkeys | `/t/{tenantSlug}/account/passkeys` |
| **Active Sessions** | View and revoke sessions | `/t/{tenantSlug}/account/sessions` |
| **Linked Accounts** | Manage social login connections | `/t/{tenantSlug}/account/linked-accounts` |

---

## Password Reset Flow

1. User clicks "Forgot Password" on the login page
2. User enters their email address
3. LumoAuth sends a password reset link (time-limited)
4. User clicks the link and sets a new password
5. All existing sessions are optionally revoked

### Password Requirements

Password policy is configured per tenant at `/t/{tenantSlug}/portal/configuration/auth-settings`:

| Setting | Description |
|---------|-------------|
| Minimum length | Minimum number of characters |
| Complexity | Require uppercase, lowercase, numbers, symbols |
| Breach detection | Check against known breached passwords |
| History | Prevent reuse of recent passwords |

---

## MFA Self-Enrollment

Users can enroll in MFA from their account settings:

1. Navigate to `/t/{tenantSlug}/account/mfa`
2. Choose a method:
   - **Authenticator App (TOTP)** - Scan QR code with Google Authenticator, Authy, etc.
   - **SMS** - Receive codes via text message
   - **Email** - Receive codes via email
3. Verify the method with a test code
4. Generate and save backup codes

See [Multi-Factor Authentication](../authentication/mfa.md) for details.

---

## Passkey Management

Users can register and manage passkeys (WebAuthn/FIDO2 credentials):

1. Navigate to `/t/{tenantSlug}/account/passkeys`
2. Click **Register Passkey**
3. Follow the browser/device prompt (fingerprint, face ID, security key)
4. Name the passkey for easy identification

Users can remove passkeys they no longer use.

See [Passkeys](../authentication/passkeys.md) for details.

---

## Linked Social Accounts

Users who authenticated via social login can manage their linked accounts:

1. Navigate to `/t/{tenantSlug}/account/linked-accounts`
2. View connected providers (Google, GitHub, Microsoft, etc.)
3. Link additional social accounts
4. Unlink a social account (if another login method is available)

---

## Session Management

Users can view and manage their active sessions:

1. Navigate to `/t/{tenantSlug}/account/sessions`
2. See all active sessions with:
   - Device and browser information
   - IP address and approximate location
   - Last activity time
3. Revoke any session that looks unfamiliar

---

## Related Guides

- [User Management Overview](overview.md) - Admin user management
- [MFA](../authentication/mfa.md) - Multi-factor authentication details
- [Passkeys](../authentication/passkeys.md) - WebAuthn/FIDO2 setup
- [Social Login](../authentication/social-login.md) - Social identity providers
