# Custom Domains

Custom domains allow you to serve your tenant's authentication pages under your own domain instead of the default `/t/{tenantSlug}/` path. This provides a branded, seamless experience for your users.

---

## How It Works

| Without Custom Domain | With Custom Domain |
|-----------------------|-------------------|
| `https://lumoauth.example.com/t/acme-corp/login` | `https://auth.acme.com/login` |
| `https://lumoauth.example.com/t/acme-corp/api/v1/oauth/authorize` | `https://auth.acme.com/api/v1/oauth/authorize` |
| `https://lumoauth.example.com/t/acme-corp/.well-known/openid-configuration` | `https://auth.acme.com/.well-known/openid-configuration` |

When a custom domain is configured, the `/t/{tenantSlug}` prefix is no longer needed. LumoAuth automatically maps requests to the correct tenant based on the domain.

---

## Setting Up a Custom Domain

### 1. Add the Domain in LumoAuth

1. Go to `/t/{tenantSlug}/portal/custom-domains`
2. Click **Add Custom Domain**
3. Enter your domain (e.g., `auth.acme.com`)

### 2. Configure DNS

Add a CNAME record pointing your domain to your LumoAuth instance:

```
auth.acme.com  CNAME  lumoauth.example.com
```

Or for an apex domain, use an A record pointing to your LumoAuth server IP.

### 3. TLS Certificate

LumoAuth handles TLS certificates for custom domains. After DNS propagation, the certificate is provisioned automatically.

### 4. Verify the Domain

Once DNS is configured, click **Verify** in the custom domains settings. LumoAuth confirms the CNAME record and activates the custom domain.

---

## OIDC Discovery with Custom Domains

When a custom domain is active, the OIDC discovery document updates automatically:

**Before:**
```json
{
  "issuer": "https://lumoauth.example.com/t/acme-corp",
  "authorization_endpoint": "https://lumoauth.example.com/t/acme-corp/api/v1/oauth/authorize",
  "token_endpoint": "https://lumoauth.example.com/t/acme-corp/api/v1/oauth/token"
}
```

**After:**
```json
{
  "issuer": "https://auth.acme.com",
  "authorization_endpoint": "https://auth.acme.com/api/v1/oauth/authorize",
  "token_endpoint": "https://auth.acme.com/api/v1/oauth/token"
}
```

> **Note:** Changing the issuer URL affects token validation. Update your applications to use the new issuer after enabling a custom domain.

---

## Multiple Custom Domains

A tenant can have multiple custom domains, but only one is designated as the **primary domain**. The primary domain is used as the token issuer and in OIDC discovery.

| Use Case | Primary Domain | Additional Domain |
|----------|---------------|-------------------|
| Login portal | `auth.acme.com` | - |
| Partner portal | `auth.acme.com` | `login.partner.acme.com` |

---

## Managing Custom Domains

### Via Portal

Navigate to `/t/{tenantSlug}/portal/custom-domains`:

- **Add** - Register a new custom domain
- **Verify** - Confirm DNS configuration
- **Set Primary** - Designate the primary domain for token issuance
- **Remove** - Delete a custom domain mapping

### Via API

```bash
# List custom domains
curl https://your-domain.com/t/{tenantSlug}/api/v1/custom-domains \
  -H "Authorization: Bearer {admin_token}"

# Add a custom domain
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/custom-domains \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"domain": "auth.acme.com"}'
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Domain verification fails | Confirm CNAME record is correctly set and propagated (`dig auth.acme.com CNAME`) |
| TLS certificate not provisioned | Wait for DNS propagation (up to 48 hours), then re-verify |
| OIDC discovery returns old URLs | Clear any caches; the discovery endpoint updates immediately on the server |
| Token validation fails after domain change | Update your applications to use the new issuer URL |

---

## Related Guides

- [Tenant Setup](tenant-setup.md) - Create and configure tenants
- [Tenant Portal](tenant-portal.md) - Navigate the admin portal
- [Applications](../applications/overview.md) - Update application URLs after domain changes
