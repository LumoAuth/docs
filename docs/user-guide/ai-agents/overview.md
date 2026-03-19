# AI Agents & MCP

LumoAuth provides first-class support for AI agent identity, enabling you to authenticate AI agents, manage their permissions, and integrate with Model Context Protocol (MCP) servers.

---

## Why AI Agent Identity?

As AI agents become part of enterprise workflows, they need:

- **Authentication** - Verify which agent is making a request
- **Authorization** - Control what each agent can access
- **Audit Trail** - Track agent actions for compliance
- **Scoped Access** - Limit agents to specific resources and operations
- **Revocation** - Disable agent access instantly

LumoAuth treats AI agents as first-class identities, similar to users and service accounts.

---

## Managing AI Agents

### Portal

Navigate to `/t/{tenantSlug}/portal/agents`:

- **Register Agent** - Create a new agent identity
- **Agent List** - View all registered agents
- **Agent Detail** - Manage credentials, permissions, and MCP connections
- **Revoke Agent** - Disable an agent immediately

### Registering an Agent

1. Go to `/t/{tenantSlug}/portal/agents`
2. Click **Register Agent**
3. Configure:

| Field | Description |
|-------|-------------|
| **Name** | Display name for the agent |
| **Description** | What the agent does |
| **Allowed Scopes** | Which scopes the agent can request |
| **Permissions** | Specific permissions granted |
| **Token Lifetime** | How long agent tokens are valid |

4. After creation, you receive:
   - **Client ID** - Agent's identity
   - **Client Secret** - Agent's credential

### Agent Authentication

Agents authenticate using the **Client Credentials** flow:

```bash
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/oauth/token \
  -d grant_type=client_credentials \
  -d client_id=AGENT_CLIENT_ID \
  -d client_secret=AGENT_CLIENT_SECRET \
  -d scope="agent:read agent:execute"
```

The returned access token contains agent-specific claims:

```json
{
  "sub": "agent-uuid",
  "client_id": "agent-client-id",
  "agent_name": "data-processor",
  "scope": "agent:read agent:execute",
  "tenant": "acme-corp",
  "iat": 1706400000,
  "exp": 1706403600
}
```

---

## Workload Identity

Agents can use workload identity tokens for service-to-service communication, providing a secure way to identify agent workloads without long-lived secrets.

---

## Model Context Protocol (MCP)

LumoAuth integrates with MCP (Model Context Protocol) servers, enabling AI agents to securely access tools and data sources.

### What is MCP?

MCP is a protocol that allows AI models to interact with external tools and data sources in a standardized way. LumoAuth acts as the authentication and authorization layer for MCP connections.

### Configuring MCP Servers

1. Go to `/t/{tenantSlug}/portal/agents` → **MCP Servers**
2. Click **Add MCP Server**
3. Configure:

| Field | Description |
|-------|-------------|
| **Name** | Display name for the MCP server |
| **URL** | MCP server endpoint |
| **Authentication** | How the agent authenticates to the MCP server |
| **Allowed Agents** | Which agents can use this MCP server |
| **Scopes** | What operations are permitted |

### MCP Authentication Flow

```
AI Agent → LumoAuth (authenticate) → Receives token → MCP Server (with token)
```

1. Agent authenticates with LumoAuth
2. LumoAuth issues a token scoped not only for the tenant but also for the MCP server
3. Agent presents the token to the MCP server
4. MCP server validates the token with LumoAuth

---

## Agent Permissions

Agents can be assigned:

- **Roles** - Same RBAC roles as users
- **Scopes** - OAuth scopes limiting API access
- **ABAC Policies** - Attribute-based conditions (e.g., time restrictions, IP ranges)
- **Zanzibar Relations** - Fine-grained per-object access

### Principle of Least Privilege

Grant agents only the minimum permissions needed:

```
Agent: data-processor
├── Scope: data:read (can read data)
├── Scope: data:transform (can process data)
└── ❌ data:delete (cannot delete data)
```

---

## Audit Trail

All agent actions are logged in the [audit log](../compliance/audit-logs.md):

| Event | Description |
|-------|-------------|
| `agent.created` | Agent registered |
| `agent.authenticated` | Agent obtained a token |
| `agent.action` | Agent performed an action |
| `agent.revoked` | Agent access revoked |
| `mcp.connection` | Agent connected to MCP server |

---

## Use Cases

| Scenario | Description |
|----------|-------------|
| **Data Processing** | Agent accesses databases and APIs to process data |
| **Customer Support** | AI assistant accesses user information to help customers |
| **Code Review** | Agent accesses repositories and review tools |
| **Monitoring** | Agent checks system health and triggers alerts |
| **Content Generation** | Agent accesses CMS and publishes content |

---

## Related Guides

- [Applications](../applications/overview.md) - Register OAuth clients for agents
- [OAuth 2.0 Client Credentials](../applications/oauth2-oidc.md) - M2M authentication
- [Access Control](../access-control/overview.md) - Agent permissions
- [Audit Logs](../compliance/audit-logs.md) - Agent activity tracking
