---
sidebar_label: OpenAI Agents SDK
---

# AAuth Quick Start – OpenAI Agents SDK

Integrate the AAuth protocol into an **OpenAI Agents SDK** agent so that
every tool call carries a cryptographically-signed identity via HTTP Message
Signatures.

:::info[Prerequisites]
- LumoAuth tenant with AAuth enabled
- Python 3.9+

Complete [Steps 1–3](./aauth-quickstart): generate key pair, register agent and resource. Verify with the [Python SDK quickstart](./aauth-qs-python) first.
:::

## Install

```bash
pip install lumoauth[aauth] openai-agents
```

## Example

```python
import asyncio
from agents import Agent, Runner, function_tool
from lumoauth.aauth import AAuthClient

# 1. Initialize the AAuth client
private_pem, jwks = AAuthClient.generate_keypair()
aauth = AAuthClient(
    agent_identifier="https://my-agent.example.com",
    private_key_pem=private_pem,
    tenant="acme-corp",
)

# 2. Obtain tokens upfront (resource token from your resource server)
resource_token = "..."
tokens = aauth.request_authorization(resource_token=resource_token, scope="read write")
if tokens.get("authorization_required"):
    raise RuntimeError("User consent required - implement OAuth redirect flow first")

ACCESS_TOKEN = tokens["access_token"]

# 3. Define tools that make AAuth-signed API calls
@function_tool
def fetch_document(document_id: str) -> str:
    """Fetch a document from the protected API."""
    resp = aauth.signed_request(
        "GET",
        f"https://api.example.com/v1/documents/{document_id}",
        auth_token=ACCESS_TOKEN,
    )
    if resp.status_code == 200:
        return resp.text
    return f"Error: HTTP {resp.status_code}"

@function_tool
def create_summary(document_id: str, summary: str) -> str:
    """Create a summary for a document in the protected API."""
    resp = aauth.signed_request(
        "POST",
        f"https://api.example.com/v1/documents/{document_id}/summaries",
        auth_token=ACCESS_TOKEN,
        json={"text": summary},
    )
    if resp.status_code in (200, 201):
        return "Summary created successfully."
    return f"Error: HTTP {resp.status_code}"

# 4. Create the OpenAI Agent
research_agent = Agent(
    name="Research Assistant",
    instructions=(
        "You are a helpful assistant with access to a protected document API. "
        "Retrieve documents and create summaries as requested."
    ),
    tools=[fetch_document, create_summary],
)

# 5. Run the agent
async def main():
    result = await Runner.run(
        research_agent,
        "Fetch document doc-42 and create a two-sentence summary.",
    )
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

## How It Works

| Component | Role |
|-----------|------|
| `AAuthClient` | Manages key material and handles AAuth token exchange |
| `aauth.signed_request(...)` | Adds `Agent-Auth` (RFC 9421) and `Authorization` headers |
| `@function_tool` | Decorates Python functions as OpenAI SDK tools |
| `ACCESS_TOKEN` | Short-lived token issued after agent + resource validation |

## Next Steps

- [AAuth Protocol spec](./aauth) - full technical details
- [JIT Permissions – OpenAI Agents SDK](./jit-openai-agents) - add per-operation permission escalation
