# Agent Registry

Register AI agents in LumoAuth to give them their own identity, capabilities, and usage limits. 
    Registered agents can authenticate and be tracked separately from users.

## Creating an Agent

Agents are typically created through the LumoAuth dashboard, but can also be created 
    programmatically. Each agent has:

| Property | Description |
| --- | --- |
| **Name** | Human-readable identifier (e.g., "Research Assistant Bot") |
| **Client ID** | Unique identifier used for OAuth authentication |
| **Client Secret** | Secret key for authentication (optional if using workload identity) |
| **Capabilities** | Scopes/permissions the agent is allowed to request |
| **Budget Policy** | Usage limits (API calls, tokens consumed, etc.) |
| **Identity Type** | How the agent authenticates (Workload Identity, AAuth, API Key, Client Credentials, Custom) |
| **Workload Identity** | External identity sources (Kubernetes, AWS, GCP) for cloud-native deployments |
| **AAuth Identity** | Agent Auth Protocol with cryptographic identity and proof-of-possession tokens |

## Agent vs OAuth Client

While agents use OAuth 2.0 for authentication, they have additional properties:

| Feature | Standard OAuth Client | Agent |
| --- | --- | --- |
| Authentication | Client credentials | Client credentials, workload identity, or AAuth protocol |
| Identity Type | Application | AI Agent |
| Usage Limits | Rate limiting only | Budget policies (tokens, API calls, costs) |
| Delegation | Not typically | Can act on behalf of users |
| UserInfo Response | Application info | Agent info with capabilities |

## Configuring Capabilities

Capabilities define what the agent can do. They map to OAuth scopes but are specifically 
    designed for agent use cases:

```json
{
  "budget_policy": {
    "max_tokens_per_day": 100000,
    "max_api_calls_per_hour": 500,
    "max_cost_per_month_usd": 50,
    "allowed_models": ["gpt-4", "claude-3-sonnet"],
    "require_approval_above_usd": 10
  }
}
```

:::warning[Budget Enforcement]
Budget limits are enforced in real-time. When an agent exceeds its budget,
subsequent requests are rejected until the budget resets or is increased.
:::


## Agent Authentication

### Install the LumoAuth Agent SDK {#install-sdk}

The `lumoauth` package provides the `LumoAuthAgent` client and a
`require_capability` decorator used in all examples on this page.

```bash
pip install lumoauth
```

**Environment variables** (set these before running any example):

| Variable | Description | Default |
| --- | --- | --- |
| `LUMOAUTH_URL` | LumoAuth instance URL | `https://app.lumoauth.dev` |
| `LUMOAUTH_TENANT` | Your tenant slug | *(required)* |
| `AGENT_CLIENT_ID` | Agent's OAuth client ID | *(required)* |
| `AGENT_CLIENT_SECRET` | Agent's OAuth client secret | *(required)* |

All four can also be passed directly to the `LumoAuthAgent()` constructor.

### Complete Example

```python
from lumoauth import LumoAuthAgent, require_capability

# 1. Initialize — reads env vars automatically
agent = LumoAuthAgent()

# 2. Authenticate (OAuth 2.0 client credentials)
if not agent.authenticate():
    raise SystemExit("Authentication failed — check credentials.")

# 3. Inspect identity and capabilities
info = agent.get_agent_info()
print(f"Agent : {info['name']}")
print(f"Caps  : {info['capabilities']}")

budget = agent.get_budget_status()
if budget:
    print(f"Tokens: {budget.get('tokens_used_today', 0)}/{budget.get('max_tokens_per_day', 'unlimited')}")

# 4. Make authenticated API calls
if agent.has_capability("read:documents"):
    resp = agent.api_request("GET", f"/t/{agent.tenant}/api/v1/documents/123")
    print(resp.json())

# 5. Token exchange for a secured MCP server (RFC 8693)
mcp_token = agent.get_mcp_token("urn:mcp:financial-data")
if mcp_token:
    print("MCP token obtained — pass it to your MCP client.")
```

### Subclassing with Capability Gates

Use the `require_capability` decorator to gate methods on agent permissions:

```python
from lumoauth import LumoAuthAgent, require_capability

class ResearchAgent(LumoAuthAgent):
    @require_capability('tool:search_web')
    def search(self, query: str) -> dict:
        return self.api_request(
            "POST", f"/t/{self.tenant}/api/v1/tools/search", data={"query": query}
        ).json()

    @require_capability('write:documents')
    def save_findings(self, data: dict) -> str:
        resp = self.api_request(
            "POST", f"/t/{self.tenant}/api/v1/documents", data=data
        )
        return resp.json()["id"]
```

## Viewing Agent in UserInfo

When an agent calls the UserInfo endpoint, it receives agent-specific information:

```json
{
  "sub": "agent:research-bot",
  "name": "Research Assistant Bot",
  "agent_id": "agt_abc123def456",
  "identity_type": "agent",
  "capabilities": [
    "read:documents",
    "tool:search_web",
    "tool:execute_code"
  ],
  "budget_policy": {
    "max_tokens_per_day": 100000,
    "tokens_used_today": 15234,
    "max_api_calls_per_hour": 500,
    "api_calls_this_hour": 47
  },
  "tenant": "acme-corp",
  "workload_identity": null
}
```

## Integrating with Agent Frameworks

LumoAuth agents can be seamlessly integrated into popular agent frameworks.
Select your framework below for a complete example showing authentication,
capability gating, budget checks, and MCP token exchange.

:::info[Prerequisites]
All examples require the `lumoauth` package ([install instructions](#install-sdk))
and the environment variables `LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, and `AGENT_CLIENT_SECRET`.
:::

| Framework | Guide |
|-----------|-------|
| LangChain / LangGraph | [View example →](./registry-langchain) |
| CrewAI | [View example →](./registry-crewai) |
| Agno | [View example →](./registry-agno) |
| Google ADK | [View example →](./registry-google-adk) |
| OpenAI Agents SDK | [View example →](./registry-openai-agents) |
| Microsoft Agent Framework | [View example →](./registry-msft) |

