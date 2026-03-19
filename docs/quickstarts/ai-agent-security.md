---
sidebar_label: Enable Security for AI Agents
---

# Enable Security for AI Agents

Give your AI agents verified identities, scoped capabilities, and auditable authorization in minutes.

:::tip[Prerequisites]
- A LumoAuth tenant with AAuth enabled — [sign up at app.lumoauth.dev](https://app.lumoauth.dev)
- Node.js 18+ or Python 3.9+
:::

---

## Step 1: Register Your Agent

Every agent needs a registered identity. In the [Tenant Portal](https://app.lumoauth.dev), go to **AI Agents → Register Agent**.

| Field | Value |
|---|---|
| Name | Your agent name (e.g. `summarizer-agent`) |
| Capabilities | The permissions this agent may request |
| JWKS URL | Your agent's public key endpoint (or paste a JWKS) |

Or register via API:

```bash
curl -X POST https://app.lumoauth.dev/t/YOUR_TENANT_SLUG/api/v1/agents/register \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "summarizer-agent",
    "capabilities": ["document.read", "document.summarize"],
    "jwks": { "keys": [{ ... }] }
  }'
```

---

## Step 2: Generate Agent Credentials

Agents authenticate with **signed JWTs** backed by a key pair (Ed25519 recommended).

### Generate a key pair

```javascript
// Node.js
const crypto = require('crypto');

const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});
console.log('Public key:\n', publicKey);
console.log('Private key (store securely):\n', privateKey);
```

```python
# Python
from cryptography.hazmat.primitives.asymmetric import ed25519
from cryptography.hazmat.primitives import serialization

private_key = ed25519.Ed25519PrivateKey.generate()
public_key = private_key.public_key()

pub_pem = public_key.public_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PublicFormat.SubjectPublicKeyInfo,
)
print(pub_pem.decode())
```

Provide the **public key** when registering the agent. Keep the **private key** in your secret manager.

---

## Step 3: Authenticate Your Agent (Get a Token)

The agent signs a short-lived JWT assertion and exchanges it for an access token:

```javascript
// Node.js — using @lumoauth/agents SDK
const { AgentAuth } = require('@lumoauth/agents');

const agent = new AgentAuth({
  tenantSlug: 'YOUR_TENANT_SLUG',
  agentId: 'YOUR_AGENT_ID',
  privateKeyPem: process.env.AGENT_PRIVATE_KEY,
});

const token = await agent.getAccessToken({
  capabilities: ['document.read', 'document.summarize'],
});
```

```python
# Python — using lumoauth-agents SDK
from lumoauth.agents import AgentAuth
import os

agent = AgentAuth(
    tenant_slug="YOUR_TENANT_SLUG",
    agent_id="YOUR_AGENT_ID",
    private_key_pem=os.environ["AGENT_PRIVATE_KEY"],
)

token = await agent.get_access_token(
    capabilities=["document.read", "document.summarize"]
)
```

---

## Step 4: Authorize Agent Actions

Use the **Ask API** for natural-language permission checks — ideal inside LLM reasoning loops:

```bash
curl -X POST https://app.lumoauth.dev/t/YOUR_TENANT_SLUG/api/v1/agents/ask \
  -H "Authorization: Bearer AGENT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question": "Can I read and summarize documents for user alice@acme.com?"}'
```

```json
{
  "allowed": true,
  "reason": "Agent has document.read and document.summarize capabilities scoped to tenant."
}
```

Or use a traditional permission check:

```bash
curl -X POST https://app.lumoauth.dev/t/YOUR_TENANT_SLUG/api/v1/authz/check \
  -H "Authorization: Bearer AGENT_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permission": "document.summarize", "subject": "agent:summarizer-agent"}'
```

---

## Step 5: Request JIT Permissions (Optional)

For sensitive operations, request **just-in-time approval** rather than holding standing permissions:

```javascript
const approval = await agent.requestJitPermission({
  permission: 'payments.authorize',
  justification: 'Processing end-of-month vendor invoices',
  expiresIn: '10m',
});

if (approval.granted) {
  await processPayments(approval.token);
}
```

LumoAuth notifies a human approver and returns the decision in real time. The granted token is scoped to that single operation and expires automatically.

---

## Step 6: Framework Integrations

Jump straight to a framework-specific guide:

| Framework | Guide |
|---|---|
| LangChain / LangGraph | [Registry](/agents/registry-langchain) · [JIT](/agents/jit-langgraph) |
| CrewAI | [Registry](/agents/registry-crewai) · [JIT](/agents/jit-crewai) |
| OpenAI Agents SDK | [Registry](/agents/registry-openai-agents) · [JIT](/agents/jit-openai-agents) |
| Agno | [Registry](/agents/registry-agno) · [JIT](/agents/jit-agno) |
| Google ADK | [Registry](/agents/registry-google-adk) · [JIT](/agents/jit-google-adk) |

---

## What's Next

| Topic | Description |
|---|---|
| [AI Agent Identity](/agents) | Full agent identity documentation |
| [AAuth Protocol](/agents/aauth) | Detailed AAuth protocol spec |
| [Ask API](/agents/ask-api) | Natural language authorization for LLMs |
| [JIT Permissions](/agents/jit) | Human-in-the-loop approval flows |
| [Chain of Agency](/agents/delegation) | Token exchange for agent delegation |
| [Workload Federation](/agents/workload-federation) | Federate with cloud workload identities |
| [MCP Servers](/mcp) | Secure Model Context Protocol servers |
