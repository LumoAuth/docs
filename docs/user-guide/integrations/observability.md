# Observability

LumoAuth provides observability tools for monitoring tenant health, authentication performance, and security events.

---

## Observability Dashboard

Navigate to `/t/{tenantSlug}/portal/observability`:

### Authentication Metrics

| Metric | Description |
|--------|-------------|
| **Login Success Rate** | Percentage of successful authentications |
| **Login Failure Rate** | Percentage of failed attempts |
| **MFA Challenge Rate** | How often MFA is triggered |
| **Average Auth Latency** | Time from request to token issuance |
| **Active Sessions** | Current active user sessions |

### User Metrics

| Metric | Description |
|--------|-------------|
| **Total Users** | Number of registered users |
| **Active Users (DAU/MAU)** | Daily and monthly active users |
| **New Registrations** | Recent signups over time |
| **Suspended Accounts** | Users currently suspended |

### Token Metrics

| Metric | Description |
|--------|-------------|
| **Tokens Issued** | Access tokens issued over time |
| **Token Revocations** | Tokens explicitly revoked |
| **Refresh Token Usage** | Refresh token exchange rate |

### Security Metrics

| Metric | Description |
|--------|-------------|
| **High Risk Events** | Count of high risk score authentications |
| **Brute Force Attempts** | Detected brute force attacks |
| **Account Lockouts** | Accounts locked due to failed attempts |
| **Impossible Travel** | Detected impossible travel events |

---

## Alerting

Configure alerts based on observability metrics:

| Alert Type | Trigger Example |
|-----------|-----------------|
| **High failure rate** | Login failures exceed 20% in 5 minutes |
| **Brute force** | > 10 failed attempts for a single user in 1 minute |
| **Unusual activity** | Login volume spikes 300% above baseline |
| **High risk score** | Average risk score exceeds threshold |

Alerts can be delivered via:
- [Webhooks](webhooks.md) - Push events to your monitoring system
- Email notifications
- Dashboard alerts in the portal

---

## Integration with External Tools

Export observability data to your preferred monitoring stack:

| Tool | Integration Method |
|------|-------------------|
| **Datadog** | Webhook events |
| **Splunk** | Log export / webhook |
| **Grafana** | Metrics API |
| **PagerDuty** | Webhook alerts |
| **Slack** | Webhook notifications |

---

## Related Guides

- [Audit Logs](../compliance/audit-logs.md) - Detailed event history
- [Webhooks](webhooks.md) - Real-time event notifications
- [Adaptive MFA](../authentication/adaptive-mfa.md) - Risk-based security monitoring
