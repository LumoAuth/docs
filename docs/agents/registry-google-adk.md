---
sidebar_label: Google ADK
---

# Agent Registry – Google ADK

Integrate a LumoAuth-registered agent with **Google Agent Development Kit (ADK)**
to authenticate, enforce budget policies, and perform token exchange for
secured MCP servers.

:::info[Prerequisites]
Install the `lumoauth` package and set the environment variables
`LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, and
`AGENT_CLIENT_SECRET`. See [Install the SDK](./registry#install-sdk).
:::

## Install

```bash
pip install lumoauth google-adk
```

## Example

```python
from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from lumoauth import LumoAuthAgent

# 1. Initialize and authenticate the LumoAuth Agent
lumo_agent = LumoAuthAgent()
lumo_agent.authenticate()

# 2. Define tools that check LumoAuth capabilities
def search_company_documents(query: str) -> dict:
    """Search internal company documents for the given query."""
    if not lumo_agent.has_capability('read:documents'):
        return {"error": "Agent lacks 'read:documents' capability."}
    return {"result": f"Found 3 documents matching '{query}'"}

def query_financial_mcp(metric: str) -> dict:
    """Query the secured financial metrics MCP server for a given metric."""
    if not lumo_agent.has_capability('mcp:financial'):
        return {"error": "Agent lacks 'mcp:financial' capability."}
    mcp_token = lumo_agent.get_mcp_token("urn:mcp:financial-data")
    if not mcp_token:
        return {"error": "Failed to obtain token for Financial MCP server."}
    return {"result": f"Retrieved {metric}: $1.2M (Authenticated via MCP Token Exchange)"}

# 3. Check budget before running
if lumo_agent.is_budget_exhausted():
    raise RuntimeError("Agent budget exhausted for today.")

# 4. Create the ADK Agent
research_agent = Agent(
    name="research_analyst",
    model="gemini-2.0-flash",
    description="A senior analyst that searches documents and queries financial metrics.",
    instruction="Use tools to search documents and query financial metrics. Provide a summary.",
    tools=[
        FunctionTool(search_company_documents),
        FunctionTool(query_financial_mcp),
    ],
)

# 5. Run the agent
async def main():
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name="research_analyst", user_id="analyst_user"
    )

    runner = Runner(agent=research_agent, app_name="research_analyst", session_service=session_service)
    content = types.Content(
        role="user",
        parts=[types.Part.from_text("Search documents for Q3 performance, then query the financial MCP for EBITDA.")],
    )

    async for event in runner.run_async(user_id="analyst_user", session_id=session.id, new_message=content):
        if event.is_final_response():
            for part in event.content.parts:
                print(part.text)

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
```

## How It Works

| Step | What happens |
|------|-------------|
| `LumoAuthAgent()` | Reads credentials from env vars and initialises the client |
| `lumo_agent.authenticate()` | Performs OAuth 2.0 client-credentials flow |
| `has_capability(...)` | Guards tool execution with LumoAuth capability checks |
| `get_mcp_token(...)` | Exchanges the agent token for an MCP-specific token (RFC 8693) |
| `FunctionTool(...)` | Wraps plain Python functions as ADK tools |

## Next Steps

- [Agent Registry overview](./registry) - manage agent registrations, budgets, and capabilities
- [JIT Permissions – Google ADK](./jit-google-adk) - add just-in-time permission escalation
