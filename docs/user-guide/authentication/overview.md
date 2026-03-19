# Authentication Overview

LumoAuth supports a wide range of authentication methods to meet the needs of consumer, enterprise, and machine-to-machine scenarios. You can combine multiple methods per tenant to create flexible, secure login experiences.

---

## Supported Authentication Methods

| Method | Description | Best For |
|--------|-------------|----------|
| [Email & Password](email-password.md) | Traditional credential-based login | All applications |
| [Social Login](social-login.md) | OAuth-based login via external providers | Consumer apps |
| [Multi-Factor Authentication](mfa.md) | Second factor verification (TOTP, SMS, email) | Security-sensitive apps |
| [Adaptive MFA](adaptive-mfa.md) | Risk-based, context-aware MFA | Reducing friction while maintaining security |
| [Passkeys & WebAuthn](passkeys.md) | FIDO2 passwordless authentication | Modern, phishing-resistant auth |
| [Enterprise SSO](enterprise-sso.md) | SAML 2.0, OIDC federation, LDAP/AD | B2B and enterprise apps |
| [Device Authorization](device-flow.md) | Input-constrained device auth | CLI tools, IoT, smart TVs |

---

## How Authentication Works in LumoAuth

### The Login Flow

1. **User initiates login** - Your application redirects the user to LumoAuth's authorization endpoint
2. **LumoAuth presents the login page** - Based on tenant configuration, shows email/password, social buttons, passkeys
3. **User authenticates** - Enters credentials, clicks social login, or uses a passkey
4. **MFA challenge (if configured)** - Prompts for second factor based on policy or risk score
5. **Consent (if needed)** - For third-party apps, the user approves requested scopes
6. **Redirect back** - LumoAuth redirects to your app with an authorization code
7. **Token exchange** - Your app exchanges the code for access, ID, and refresh tokens

### Tenant-Specific Authentication

All authentication flows use tenant-specific URLs:

```
Authorization:  /t/{tenantSlug}/api/v1/oauth/authorize
Token:          /t/{tenantSlug}/api/v1/oauth/token
User Info:      /t/{tenantSlug}/api/v1/oauth/userinfo
OIDC Discovery: /t/{tenantSlug}/api/v1/.well-known/openid-configuration
```

Each tenant can independently configure:
- Which authentication methods are enabled
- Social login providers and their credentials
- MFA policies and enforcement
- Adaptive authentication risk thresholds
- Password policies and complexity requirements
- Email verification requirements

---

## Authentication Configuration

Configure authentication for a tenant at:

```
/t/{tenantSlug}/portal/configuration/auth-settings
```

### Settings Available

| Setting | Description |
|---------|-------------|
| **Allow Registration** | Enable/disable user self-registration |
| **Require Email Verification** | Users must verify their email before login |
| **Password Policy** | Minimum length, complexity, and rotation rules |
| **MFA Policy** | Required, optional, or adaptive MFA |
| **Adaptive Auth** | Risk-based authentication triggers |
| **Session Settings** | Session lifetime, concurrent session limits |
| **Trusted Devices** | Remember trusted devices to reduce MFA prompts |

---

## Choosing the Right Authentication Method

### For Consumer Applications (B2C)

Start with **Email/Password** + **Social Login** for the best user experience. Add **Adaptive MFA** to protect high-risk logins without adding friction for normal users.

### For Business Applications (B2B)

Use **Enterprise SSO** (SAML 2.0 or OIDC) so employees can log in with their corporate identity provider. Layer on **MFA** enforcement for compliance.

### For Machine-to-Machine

Use the **Client Credentials** grant type - no user interaction needed. See [Applications Overview](../applications/overview.md).

### For CLI Tools and IoT

Use the **Device Authorization Flow** - display a code on the device, user authenticates on their phone or computer.

---

## Security Features Across All Methods

Regardless of which authentication method you choose, LumoAuth provides:

- **Brute-force protection** - Rate limiting on login attempts
- **CSRF protection** - All forms include CSRF tokens
- **Secure password hashing** - bcrypt with configurable cost factor
- **Login attempt logging** - Every attempt is recorded in the audit log
- **Session management** - Track and revoke active sessions
- **Email verification** - Prevent account takeover via unverified emails

---

## Next Steps

Choose an authentication method to learn more:

- [Email & Password](email-password.md)
- [Social Login](social-login.md)
- [Multi-Factor Authentication](mfa.md)
- [Adaptive MFA](adaptive-mfa.md)
- [Passkeys & WebAuthn](passkeys.md)
- [Enterprise SSO](enterprise-sso.md)
- [Device Authorization Flow](device-flow.md)
