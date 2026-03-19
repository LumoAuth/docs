# Signing Keys

LumoAuth uses cryptographic signing keys to sign JWTs (access tokens, ID tokens) and SAML assertions. Proper key management ensures token integrity and enables secure key rotation.

---

## Key Types

| Key Type | Algorithm | Use Case |
|----------|-----------|----------|
| **RSA** | RS256, RS384, RS512 | Default; widely supported |
| **Elliptic Curve** | ES256, ES384, ES512 | Smaller keys, faster operations |

---

## Managing Signing Keys

### Portal

Navigate to `/t/{tenantSlug}/portal/signing-keys`:

- **Active Key** - Currently used for signing new tokens
- **Previous Keys** - Keys that can still verify existing tokens
- **Rotate Key** - Generate a new key and retire the current one

### JWKS Endpoint

Applications verify tokens by fetching the public keys:

```
GET /t/{tenantSlug}/.well-known/jwks.json
```

Response:

```json
{
  "keys": [
    {
      "kty": "RSA",
      "kid": "key-id-1",
      "use": "sig",
      "alg": "RS256",
      "n": "...",
      "e": "AQAB"
    }
  ]
}
```

---

## Key Rotation

### Why Rotate Keys?

- **Security best practice** - Periodic rotation limits exposure if a key is compromised
- **Compliance** - Some standards require regular rotation
- **Key compromise** - Immediate rotation if a key is suspected compromised

### Rotation Process

1. Go to `/t/{tenantSlug}/portal/signing-keys`
2. Click **Rotate Key**
3. A new key is generated and becomes the active signing key
4. The old key remains in JWKS for a grace period to verify existing tokens
5. After the grace period, the old key is removed

### Grace Period

During rotation, both the old and new keys are published in the JWKS endpoint. This allows:
- New tokens to be signed with the new key
- Existing tokens signed with the old key to still be verified
- Applications to cache the new key before the old one expires

---

## Token Verification

Applications should:

1. Fetch the JWKS from `/.well-known/jwks.json`
2. Cache the keys (refresh periodically or on `kid` mismatch)
3. Match the `kid` in the token header to the correct key
4. Verify the signature

```javascript
// Node.js example with jwks-rsa
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://your-domain.com/t/acme-corp/.well-known/jwks.json',
  cache: true,
  rateLimit: true
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    callback(null, key.getPublicKey());
  });
}
```

---

## Related Guides

- [OAuth 2.0 & OIDC](oauth2-oidc.md) - Token flows and OIDC features
- [SAML Applications](saml.md) - SAML assertion signing
- [Applications Overview](overview.md) - Application management
