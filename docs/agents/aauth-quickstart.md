# Agent Auth (AAuth) - Quick Start Guide

Get your agent authenticated and authorized in 5 minutes. This guide walks you through 
    the essential steps to implement Agent Auth in your application.

:::note[Time to Complete]
This quickstart takes approximately 15-20 minutes to complete from start to finish.
:::


## Prerequisites

- Access to a LumoAuth tenant (e.g., `acme-corp`)
- Node.js 18+ or Python 3.9+ installed
- Basic understanding of OAuth 2.0 concepts

:::warning[Important Setup Requirements]
You'll need a LumoAuth tenant with AAuth enabled, and a server environment
capable of generating Ed25519 or RSA key pairs.
:::


## Step 1: Generate Key Pair (1 min)

Agent Auth requires cryptographic keys. Generate an Ed25519 key pair:

```javascript
// Node.js
const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Convert public key to raw bytes for JWK
const publicKeyBytes = Buffer.from(
  publicKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\n/g, ''),
  'base64'
).slice(-32);

const jwks = {
  keys: [{
    kty: 'OKP',
    crv: 'Ed25519',
    x: publicKeyBytes.toString('base64url'),
    use: 'sig',
    kid: 'key-1'
  }]
};

console.log('JWKS:', JSON.stringify(jwks, null, 2));
console.log('\nPrivate Key (save securely):');
console.log(privateKey);
```

```python
# Python
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization
import base64
import json

# Generate key pair
private_key = ed25519.Ed25519PrivateKey.generate()
public_key = private_key.public_key()

# Export public key
public_bytes = public_key.public_bytes(
    encoding=serialization.Encoding.Raw,
    format=serialization.PublicFormat.Raw
)

jwks = {
    "keys": [{
        "kty": "OKP",
        "crv": "Ed25519",
        "x": base64.urlsafe_b64encode(public_bytes).decode().rstrip('='),
        "use": "sig",
        "kid": "key-1"
    }]
}

print('JWKS:', json.dumps(jwks, indent=2))
print('\nSave your private key securely!')
```

:::warning[Security Note]
Only call the introspection endpoint from your backend server. Never expose
your client credentials or call this endpoint from client-side code.
:::


## Step 2: Register Your Agent (2 min)

Navigate to your tenant's portal to register your agent:

:::tip[Registration URL]
Navigate to your tenant portal to register agents and resources, or use the
Admin API for programmatic registration.
:::


Fill in the registration form:

| Field | Example Value | Description |
| --- | --- | --- |
| **Name** | My First Agent | Human-readable agent name |
| **Agent Identifier** | `https://my-agent.example.com` | HTTPS URL uniquely identifying your agent |
| **Description** | Testing AAuth protocol | Optional description |
| **JWKS** | Paste your JWKS from Step 1 | Your agent's public keys |
| **Redirect URI** | `https://my-agent.example.com/oauth/callback` | Where to send authorization codes |
| **Allowed Scopes** | `read write` | Scopes this agent can request |

Enable features:

- ✅ **User Authorization Enabled**
- ✅ **Delegation Enabled**

Click **Create Agent** to complete registration.

## Step 3: Register a Resource (1 min)

Register the protected resource (API) your agent will access:

:::tip[Registration URL]
Navigate to your tenant portal to register agents and resources, or use the
Admin API for programmatic registration.
:::


| Field | Example Value |
| --- | --- |
| **Name** | My API |
| **Resource Identifier** | `https://api.example.com` |
| **JWKS URI** | `https://api.example.com/.well-known/jwks.json` |
| **Supported Scopes** | `read`, `write` |
| **Default Auth Level** | `authorized` |

## Step 4: Make Your First Request (1 min)

Now you're ready to authenticate your agent and access the resource.
Choose your language or framework below for a complete, copy-paste example.

| Framework / Language | Guide |
|----------------------|-------|
| Python (LumoAuth SDK) | [View example →](./aauth-qs-python) |
| JavaScript / Node.js | [View example →](./aauth-qs-nodejs) |
| LangChain / LangGraph | [View example →](./aauth-qs-langchain) |
| CrewAI | [View example →](./aauth-qs-crewai) |
| OpenAI Agents SDK | [View example →](./aauth-qs-openai-agents) |


