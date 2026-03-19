# Security

LumoAuth is built with security as a core design principle. This section covers the security features, best practices, and protections built into the platform.

---

## Security Features Overview

| Feature | Description |
|---------|-------------|
| **Adaptive MFA** | Risk-based multi-factor authentication |
| **Brute Force Protection** | Account lockout after failed attempts |
| **Impossible Travel Detection** | Flag logins from geographically impossible locations |
| **Rate Limiting** | Protect endpoints from abuse |
| **Token Security** | DPoP, short-lived tokens, revocation |
| **Session Security** | Secure cookies, fixation protection, idle timeout |
| **CSRF Protection** | Cross-site request forgery prevention |
| **Password Security** | Breach detection, complexity requirements, hashing |
| **Tenant Isolation** | Complete data separation between tenants |
| **Audit Logging** | Comprehensive event trail |
| **Signing Key Rotation** | Periodic cryptographic key rotation |

---

## Attack Protection

### Brute Force

LumoAuth detects and blocks brute force attacks:

| Setting | Description | Default |
|---------|-------------|---------|
| **Max Failed Attempts** | Failed logins before lockout | 5 |
| **Lockout Duration** | How long the account is locked | 30 minutes |
| **Progressive Delay** | Increasing delay between attempts | Enabled |
| **IP-Based Blocking** | Block IPs with excessive failures | Enabled |

When an account is locked:
- The user receives an email notification
- An audit log entry is created
- A webhook event is fired (if configured)

### Credential Stuffing

LumoAuth mitigates credential stuffing through:
- Breached password detection (checks against known breach databases)
- Rate limiting on login endpoints
- Adaptive MFA that triggers on suspicious patterns
- Anomaly detection for login patterns

### Bot Protection

- Rate limiting per IP address
- CAPTCHA integration for suspect requests
- Device fingerprinting for risk assessment

---

## Password Security

| Feature | Description |
|---------|-------------|
| **Bcrypt Hashing** | Passwords are hashed with bcrypt (cost factor 12+) |
| **Breach Detection** | Passwords checked against known breaches |
| **Minimum Length** | Configurable minimum password length |
| **Complexity Rules** | Require uppercase, lowercase, numbers, symbols |
| **History** | Prevent reuse of recent passwords |
| **Rotation Reminders** | Optional password age reminders |

---

## Token Security

| Feature | Description |
|---------|-------------|
| **Short-lived access tokens** | Default 1-hour expiration |
| **Refresh token rotation** | New refresh token issued on each use |
| **Token revocation** | Immediate revocation via API |
| **DPoP binding** | Bind tokens to client cryptographic keys (RFC 9449) |
| **JWT signing** | RSA or EC signing with key rotation |
| **Audience restriction** | Tokens scoped to specific applications |
| **RFC 9068 compliance** | JWT access tokens follow standard format |

---

## Network Security

| Feature | Description |
|---------|-------------|
| **TLS mandatory** | All endpoints require HTTPS |
| **HSTS** | Strict Transport Security headers |
| **Secure cookies** | HttpOnly, Secure, SameSite flags |
| **CORS** | Configurable allowed origins per application |
| **CSP** | Content Security Policy headers |

---

## Tenant Security

| Feature | Description |
|---------|-------------|
| **Data isolation** | All queries scoped to current tenant |
| **Separate signing keys** | Each tenant has independent signing keys |
| **Independent auth config** | MFA, password policy, social login per tenant |
| **Cross-tenant protection** | Authorization checks prevent cross-tenant access |

---

## Security Configuration

Configure security settings at:

| Setting | Location |
|---------|----------|
| Password policy | `/t/{tenantSlug}/portal/configuration/auth-settings` |
| MFA policy | `/t/{tenantSlug}/portal/configuration/auth-settings` |
| Adaptive auth | `/t/{tenantSlug}/portal/configuration/adaptive-auth` |
| Rate limiting | `/t/{tenantSlug}/portal/configuration/auth-settings` |
| Signing keys | `/t/{tenantSlug}/portal/signing-keys` |

---

## In This Section

| Guide | Description |
|-------|-------------|
| [Rate Limiting](rate-limiting.md) | API rate limiting and throttling |
| [Security Best Practices](best-practices.md) | Recommendations for secure deployment |
