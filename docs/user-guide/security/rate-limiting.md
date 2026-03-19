# Rate Limiting

LumoAuth applies rate limiting to protect endpoints from abuse, brute force attacks, and excessive load. Rate limits are enforced per tenant and per IP address.

---

## Rate Limit Tiers

| Endpoint Category | Rate Limit | Window |
|-------------------|-----------|--------|
| **Login** | 10 requests | Per minute per IP |
| **Token** | 30 requests | Per minute per client |
| **Registration** | 5 requests | Per minute per IP |
| **Password Reset** | 3 requests | Per minute per email |
| **MFA Verification** | 5 requests | Per minute per user |
| **API (authenticated)** | 100 requests | Per minute per token |
| **API (unauthenticated)** | 20 requests | Per minute per IP |
| **SCIM** | 100 requests | Per minute per token |
| **Webhooks** | N/A | Outbound, not rate-limited |

---

## Rate Limit Headers

All API responses include rate limit headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706400060
```

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed in the window |
| `X-RateLimit-Remaining` | Requests remaining in the current window |
| `X-RateLimit-Reset` | Unix timestamp when the window resets |

---

## Rate Limit Exceeded

When a rate limit is exceeded, the API returns:

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30

{
  "error": "rate_limit_exceeded",
  "error_description": "Too many requests. Try again in 30 seconds.",
  "retry_after": 30
}
```

### Handling Rate Limits

```javascript
async function apiCallWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '5');
      await new Promise(r => setTimeout(r, retryAfter * 1000));
      continue;
    }

    return response;
  }
  throw new Error('Rate limit exceeded after max retries');
}
```

---

## IP-Based Protection

In addition to rate limits, LumoAuth tracks IP behavior:

| Protection | Description |
|-----------|-------------|
| **Progressive delays** | Increasing wait times after failed attempts from same IP |
| **Temporary IP blocks** | IPs with excessive failures are temporarily blocked |
| **Trusted IP whitelisting** | Exempt specific IP ranges from rate limits |

Configure trusted IPs at `/t/{tenantSlug}/portal/configuration/adaptive-auth`.

---

## Related Guides

- [Security Overview](overview.md) - Full security features
- [Adaptive MFA](../authentication/adaptive-mfa.md) - Risk-based authentication
- [Security Best Practices](best-practices.md) - Deployment recommendations
