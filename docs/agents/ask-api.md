# The Ask API

The `/ask` API is the primary interface for AI Agents to interact with the identity system. 
    It provides a natural, instruction-friendly way for agents to verify their capabilities before executing a tool or action.

:::tip[Designed for LLM Tool-Calling]
The Ask API returns structured responses optimized for LLM function-calling
patterns, making it easy to integrate authorization into AI agent reasoning loops.
:::


## Check Capability

    
        **POST** 
        `/t/\{tenantSlug\}/api/v1/agents/ask`
    
    
Verifies if the calling agent is authorized to perform a specific action within a given context.

### Request Body

| Field | Type | Description |
| --- | --- | --- |
| `action` | `string` | **Required.** The permission or action slug (e.g., `document.read`). |
| `context` | `object` | Optional data required for the check (e.g., `{"id": "123"}`). |

### Example Request

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/agents/ask \
  -H "Authorization: Bearer agent_token_abc" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "document.read",
    "context": {
      "id": "doc_99"
    }
  }'
```

### Example Response

```json
{
  "allowed": true,
  "action": "document.read",
  "context": {
    "id": "doc_99"
  },
  "reason": "Agent has authorized capability for 'document.read'.",
  "audit_id": "8f3a1b2c4d5e6f7a"
}
```

## Self Inspection

    
        **GET** 
        `/t/\{tenantSlug\}/api/v1/agents/me`
    
    
Allows an agent to discover its own identity, capabilities (roles), and tenant environment.

### Example Response

```json
{
  "identity": {
    "id": "agt_91827364",
    "type": "agent",
    "tenant": "Acme Corp"
  },
  "capabilities": [
    "ROLE_RESEARCHER",
    "ROLE_DATA_READER"
  ],
  "workspace": {
    "slug": "acme",
    "api_base": "/t/acme-corp/api/v1/"
  }
}
```

## Integration Strategy

When building an agent, use the `/ask` API inside your tool definitions. 
    Before your agent attempts to call a tool like `get_document(id)`, it should perform an internal "pre-flight" check via `/ask`. 
    If `allowed` is false, the agent can use the `reason` field to inform the user or request delegation.

### Using the Python SDK

The `lumoauth` package exposes the Ask API via `ask()`, `is_allowed()`, and `get_identity()`:

```bash
pip install lumoauth
```

```python
from lumoauth import LumoAuthAgent

agent = LumoAuthAgent()   # reads env vars
agent.authenticate()

# Pre-flight check before executing a tool
result = agent.ask("document.read", context={"id": "doc_99"})
if result["allowed"]:
    # proceed with the tool call
    ...
else:
    print(f"Denied: {result['reason']}")

# Shorthand
if agent.is_allowed("document.read", {"id": "doc_99"}):
    ...

# Self-inspection
identity = agent.get_identity()
print(identity["capabilities"])   # e.g. ["ROLE_RESEARCHER", "ROLE_DATA_READER"]
print(identity["workspace"])      # e.g. {"slug": "acme", "api_base": "/t/acme-corp/api/v1/"}
```
