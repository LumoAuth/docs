# Multi-Factor Authentication (MFA)

Multi-Factor Authentication adds an extra layer of security by requiring users to verify their identity with a second factor beyond their password.

---

## Supported MFA Methods

| Method | How It Works | Setup |
|--------|-------------|-------|
| **TOTP (Authenticator App)** | Time-based one-time passwords via apps like Google Authenticator, Authy, 1Password | Scan a QR code to enroll |
| **SMS** | One-time code sent via text message | Enter and verify phone number |
| **Email** | One-time code sent to the user's email | Uses verified email address |
| **Backup Codes** | Pre-generated one-time recovery codes | Downloaded at enrollment time |

---

## How MFA Works

### MFA During Login

1. User enters their email and password (first factor)
2. LumoAuth validates the credentials
3. If MFA is required → user is redirected to the MFA challenge page
4. User provides their second factor (TOTP code, SMS code, etc.)
5. LumoAuth validates the second factor
6. Login is complete - tokens are issued

### MFA Enrollment

When MFA is enabled but a user hasn't enrolled yet:

1. After first login, the user is redirected to `/auth/mfa-enrollment`
2. User selects their preferred MFA method
3. User completes enrollment:
   - **TOTP**: Scan QR code with authenticator app, then enter a verification code
   - **SMS**: Enter phone number, verify with a code sent via SMS
   - **Email**: Verify with a code sent to their email
4. **Backup codes** are generated and displayed - user must save them
5. Future logins will require the enrolled MFA method

---

## Configuration

### Enable MFA for a Tenant

Navigate to **Configuration** → **Auth Settings** at:
```
/t/{tenantSlug}/portal/configuration/auth-settings
```

Under the **Multi-Factor Authentication** section:

| Setting | Options | Description |
|---------|---------|-------------|
| **MFA Policy** | Off, Optional, Required, Adaptive | How MFA is enforced |
| **Allowed Methods** | TOTP, SMS, Email, Backup Codes | Which methods users can choose from |
| **Default Method** | TOTP (recommended) | Pre-selected method during enrollment |
| **Grace Period** | 0-30 days | Time before MFA is required for new users |
| **Remember Device** | On/Off | Trust devices for configurable period |

### MFA Policy Options

| Policy | Behavior |
|--------|----------|
| **Off** | MFA is completely disabled |
| **Optional** | Users can opt-in to MFA from account settings |
| **Required** | All users must enroll in MFA after their next login |
| **Adaptive** | MFA is triggered based on risk assessment - see [Adaptive MFA](adaptive-mfa.md) |

---

## MFA Enrollment Page

When MFA enrollment is required, users see the enrollment page at:
```
/auth/mfa-enrollment
```

### TOTP Enrollment

1. A QR code is displayed along with a manual entry secret
2. User scans the QR code with their authenticator app
3. User enters the 6-digit code from the app to verify
4. Enrollment is confirmed

### SMS Enrollment

1. User enters their phone number
2. A verification code is sent via SMS
3. User enters the code to verify
4. Phone number is saved for future MFA challenges

### Email Enrollment

1. Users whose email is already verified can use it for MFA
2. A verification code is sent to their email during each MFA challenge
3. No additional enrollment step needed

### Backup Codes

After enrolling in any MFA method:

1. A set of 10 single-use backup codes is generated
2. Codes are displayed once - the user must save them
3. Each code can be used once to bypass the primary MFA method
4. New codes can be regenerated (invalidating old ones)

---

## MFA Challenge Page

During login, if MFA is triggered, the challenge page is shown at:
```
/login/mfa-challenge
```

The challenge page:
- Shows the user's enrolled MFA method
- Accepts the one-time code input
- Offers a link to use backup codes if needed
- Handles retry and rate limiting

---

## MFA Setup Page (Self-Service)

Users can manage their MFA settings from the account security page:
```
/account/security
```

Or the dedicated MFA setup page:
```
/auth/mfa-setup
```

From here users can:
- Enroll in additional MFA methods
- Change their primary MFA method
- View remaining backup codes
- Regenerate backup codes
- Disable MFA (if tenant policy allows)

---

## MFA for Administrators

### View User MFA Status

In the tenant portal, admins can see MFA enrollment status:
```
/t/{tenantSlug}/portal/access-management/users
```

Each user listing shows:
- MFA enrolled: Yes/No
- MFA method: TOTP, SMS, Email
- Last MFA challenge timestamp

### Reset User MFA

If a user loses access to their MFA device:

1. Go to the user's profile in the tenant portal
2. Click **Reset MFA**
3. The user's MFA enrollment is cleared
4. On next login, the user will be prompted to re-enroll

---

## Trusted Devices

When "Remember Device" is enabled:

1. After successful MFA, the user can mark the device as trusted
2. Future logins from the same device skip MFA
3. Trust expires after a configurable period (e.g., 30 days)
4. Users can revoke trusted devices from account settings
5. Admins can clear all trusted devices for a user

---

## Best Practices

1. **Use "Required" or "Adaptive"** for production applications
2. **Always enable backup codes** to prevent lockouts
3. **Recommend TOTP** as the primary method (most secure and reliable)
4. **Enable "Remember Device"** to reduce friction for trusted devices
5. **Set reasonable grace periods** when rolling out mandatory MFA to existing users
6. **Monitor MFA events** in the audit log for suspicious activity

---

## Related Guides

- [Adaptive MFA](adaptive-mfa.md) - Risk-based MFA that triggers only when needed
- [Email & Password](email-password.md) - First factor configuration
- [Passkeys & WebAuthn](passkeys.md) - Passwordless alternative that replaces MFA
- [Audit Logs](../compliance/audit-logs.md) - Monitor MFA events
