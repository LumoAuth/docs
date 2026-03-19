---
sidebar_label: JavaScript / Node.js
---

# AAuth Quick Start – JavaScript / Node.js

Implement the AAuth protocol in a Node.js application to authenticate your
agent and access protected resources with cryptographic HTTP signatures.

:::info[Prerequisites]
- LumoAuth tenant with AAuth enabled
- Node.js 18+ installed

Complete [Steps 1–3](./aauth-quickstart) first: generate your key pair, register your agent, and register a resource.
:::

## Complete Example

```javascript
const crypto = require('crypto');

// Configuration
const config = {
  tenantSlug: 'acme-corp',
  agentIdentifier: 'https://my-agent.example.com',
  resourceIdentifier: 'https://api.example.com',
  authServerUrl: 'https://app.lumoauth.dev',
  privateKey: process.env.AGENT_PRIVATE_KEY, // Load securely
  redirectUri: 'https://my-agent.example.com/oauth/callback'
};

// Helper: Sign HTTP request (RFC 9421)
function signRequest(method, url, headers = {}, body = null) {
  const components = [
    `"@method": ${method}`,
    `"@target-uri": ${url}`
  ];
  
  if (body) {
    const bodyStr = JSON.stringify(body);
    const digest = crypto.createHash('sha256').update(bodyStr).digest('base64');
    const contentDigest = `sha-256=:${digest}:`;
    components.push(`"content-type": application/json`);
    components.push(`"content-digest": ${contentDigest}`);
    headers['Content-Digest'] = contentDigest;
  }
  
  const signatureBase = components.join('\n');
  const signature = crypto.sign(null, Buffer.from(signatureBase), 
    crypto.createPrivateKey(config.privateKey));
  
  const covered = components.map(c => c.split('"')[1]).join(' ');
  const agentAuth = `sig1=:${signature.toString('base64')}:; ` +
    `label="sig1"; alg="ed25519"; ` +
    `keyid="${config.agentIdentifier}#key-1"; ` +
    `created=${Math.floor(Date.now() / 1000)}; ` +
    `covered="${covered}"`;
  
  return { agentAuth, headers };
}

// Step 1: Get resource token
async function getResourceToken() {
  const body = {
    resource_identifier: config.resourceIdentifier,
    audience: `${config.authServerUrl}/t/${config.tenantSlug}/api/v1`,
    lifetime: 300
  };
  
  const response = await fetch(
    `${config.authServerUrl}/t/${config.tenantSlug}/api/v1/aauth/resource/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.resourceIdentifier}`
      },
      body: JSON.stringify(body)
    }
  );
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get resource token: ${response.status} ${errorText}`);
  }
  
  const data = await response.json();
  return data.resource_token;
}

// Step 2: Request authorization
async function requestAuthorization(agentToken, resourceToken) {
  const requestBody = {
    request_type: 'auth',
    agent_token: agentToken,
    resource_token: resourceToken,
    scope: 'read write',
    redirect_uri: config.redirectUri
  };
  
  const url = `${config.authServerUrl}/t/${config.tenantSlug}/api/v1/aauth/agent/token`;
  const { agentAuth, headers } = signRequest('POST', url, {}, requestBody);
  
  headers['Content-Type'] = 'application/json';
  headers['Agent-Auth'] = agentAuth;
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody)
  });
  
  if (response.status === 401) {
    // User authorization required
    const data = await response.json();
    console.log('Redirect user to:', data.auth_url);
    return null;
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Authorization request failed: ${response.status} ${errorText}`);
  }
  
  return await response.json();
}

// Step 3: Exchange authorization code (after user consent)
async function exchangeCode(code, requestToken) {
  const requestBody = {
    request_type: 'code',
    code: code,
    request_token: requestToken
  };
  
  const url = `${config.authServerUrl}/t/${config.tenantSlug}/api/v1/aauth/agent/token`;
  const { agentAuth, headers } = signRequest('POST', url, {}, requestBody);
  
  headers['Content-Type'] = 'application/json';
  headers['Agent-Auth'] = agentAuth;
  
  const response = await fetch(url, { method: 'POST', headers, body: JSON.stringify(requestBody) });
  return await response.json();
}

// Step 4: Access the protected resource
async function callResourceApi(authToken, endpoint) {
  const url = `${config.resourceIdentifier}${endpoint}`;
  const headers = { 'Authorization': `Bearer ${authToken}` };
  const { agentAuth } = signRequest('GET', url, headers);
  headers['Agent-Auth'] = agentAuth;
  
  const response = await fetch(url, { headers });
  return await response.json();
}

// Main flow
async function main() {
  const resourceToken = await getResourceToken();
  // pass your agentToken (e.g. from a delegation flow or direct agent token)
  const agentToken = 'your_agent_token_here';
  const tokens = await requestAuthorization(agentToken, resourceToken);
  
  if (!tokens) {
    console.log('User authorization required - check console for URL');
    return;
  }
  
  const data = await callResourceApi(tokens.access_token, '/v1/data');
  console.log('Success! Got data:', data);
}

main().catch(console.error);
```

## Troubleshooting

| Error | Likely cause | Fix |
|-------|-------------|-----|
| 401 on resource token | Resource not registered | Verify resource identifier in portal |
| Signature verification failed | Wrong key format or JWKS mismatch | Regenerate JWKS from the same private key |
| 404 agent not found | Identifier mismatch | Match identifier exactly (inc. https:// and trailing slashes) |

## Next Steps

- [AAuth Protocol spec](./aauth) - full technical details
- [AAuth Quick Start – LangChain](./aauth-qs-langchain) - embed AAuth inside a LangGraph agent
