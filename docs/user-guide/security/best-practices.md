# Security Best Practices

Recommendations for securing your LumoAuth deployment and applications.

---

## Authentication

| Practice | Why |
|----------|-----|
| **Enable MFA** | Require or encourage MFA for all users |
| **Use Adaptive MFA** | Automatically challenge high-risk logins |
| **Enforce strong passwords** | Minimum 12 characters, complexity, breach detection |
| **Offer passkeys** | Phishing-resistant, most secure option |
| **Use PKCE** | Required for public clients (SPAs, mobile) |
| **Implement DPoP** | Bind tokens to client keys to prevent theft |

## Token Management

| Practice | Why |
|----------|-----|
| **Short access token lifetimes** | Limit exposure window (1 hour or less) |
| **Use refresh token rotation** | Issue new refresh token on each use |
| **Validate tokens server-side** | Verify signatures and claims in your backend |
| **Check audience claims** | Ensure tokens are meant for your application |
| **Revoke tokens on logout** | Don't rely only on expiration |
| **Use HTTPS only** | Never transmit tokens over plain HTTP |

## Application Configuration

| Practice | Why |
|----------|-----|
| **Restrict redirect URIs** | Use exact match, avoid wildcards |
| **Limit scopes** | Request only needed scopes |
| **Rotate client secrets** | Periodically rotate confidential client secrets |
| **Use confidential clients** | Prefer server-side apps that can keep secrets |
| **Validate state parameter** | Prevent CSRF on authorization callbacks |

## Access Control

| Practice | Why |
|----------|-----|
| **Principle of least privilege** | Grant minimum permissions needed |
| **Regular access reviews** | Audit role assignments quarterly |
| **Use groups for role assignment** | Easier to manage and audit |
| **Test access policies** | Use the Permission Tester before deploying |
| **Separate admin roles** | Don't give everyone full admin access |

## Tenant Security

| Practice | Why |
|----------|-----|
| **Use custom domains** | Professional appearance, branded URLs |
| **Rotate signing keys** | Periodic key rotation limits compromise window |
| **Enable audit logging** | Track all authentication and admin events |
| **Configure webhooks** | Real-time alerts for security events |
| **Review audit logs** | Regular review of suspicious activity |

## Monitoring

| Practice | Why |
|----------|-----|
| **Monitor failed logins** | Detect brute force and credential stuffing |
| **Alert on anomalies** | Unusual login patterns may indicate compromise |
| **Track high-risk events** | Act on impossible travel and risk score alerts |
| **Export logs to SIEM** | Centralized security monitoring |
| **Set up incident response** | Define playbook for security events |

---

## Deployment Checklist

- [ ] TLS enabled for all endpoints
- [ ] Strong password policy configured
- [ ] MFA enabled (required or adaptive)
- [ ] Brute force protection active
- [ ] Rate limiting configured
- [ ] Signing keys rotated from defaults
- [ ] Audit logging enabled
- [ ] Webhook alerts for security events
- [ ] Access control policies reviewed
- [ ] Client applications use PKCE
- [ ] Redirect URIs restricted to exact matches
- [ ] Custom domain configured
- [ ] Monitoring and alerting active

---

## Related Guides

- [Security Overview](overview.md) - Security features reference
- [Adaptive MFA](../authentication/adaptive-mfa.md) - Risk-based authentication
- [Audit Logs](../compliance/audit-logs.md) - Event monitoring
- [Rate Limiting](rate-limiting.md) - API protection
