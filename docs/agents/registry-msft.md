---
sidebar_label: Microsoft Agent Framework
---

# Agent Registry – Microsoft Agent Framework

Integrate a LumoAuth-registered agent with the **Microsoft Agent Framework**
to authenticate, enforce budget policies, and perform token exchange for
secured MCP servers.

:::info[Prerequisites]
Install the `lumoauth` package and set the environment variables
`LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, and
`AGENT_CLIENT_SECRET`. See [Install the SDK](./registry#install-sdk).
:::

## Install

```bash
pip install lumoauth agent-framework[openai]
```

## Example

```python
import asyncio
from typing import Annotated
from agent_framework import ChatAgent, ai_function
from agent_framework.openai import OpenAIChatClient
from lumoauth import LumoAuthAgent

# 1. Initialize and authenticate the LumoAuth Agent
lumo_agent = LumoAuthAgent()
lumo_agent.authenticate()

# 2. Define tools that check LumoAuth capabilities
@ai_function
def search_company_documents(
    query: Annotated[str, "The search query for company documents"],
) -> str:
    """Search internal company documents for the given query."""
    if not lumo_agent.has_capability('read:documents'):
        return "Error: Agent lacks 'read:documents' capability."
    return f"Found 3 documents matching '{query}'"

@ai_function
def query_financial_mcp(
    metric: Annotated[str, "The financial metric to query"],
) -> str:
    """Query the secured financial metrics MCP server for a given metric."""
    if not lumo_agent.has_capability('mcp:financial'):
        return "Error: Agent lacks 'mcp:financial' capability."
    mcp_token = lumo_agent.get_mcp_token("urn:mcp:financial-data")
    if not mcp_token:
        return "Error: Failed to obtain token for Financial MCP server."
    return f"Retrieved {metric}: $1.2M (Authenticated via MCP Token Exchange)"

# 3. Check budget before running
if lumo_agent.is_budget_exhausted():
    raise RuntimeError("Agent budget exhausted for today.")

# 4. Create the Microsoft Agent Framework agent
client = OpenAIChatClient(model="gpt-4")
agent = ChatAgent(
    chat_client=client,
    name="Research Analyst",
    instructions="You are a senior analyst. Use tools to search documents and query financial metrics.",
    tools=[search_company_documents, query_financial_mcp],
)

# 5. Run the agent
async def main():
    thread = agent.get_new_thread()
    response = await agent.run(
        messages="Search documents for Q3 performance, then query the financial MCP for EBITDA.",
        thread=thread,
    )
    for message in response.messages:
        print(message.text)

if __name__ == "__main__":
    asyncio.run(main())
```

## How It Works

| Step | What happens |
|------|-------------|
| `LumoAuthAgent()` | Reads credentials from env vars and initialises the client |
| `lumo_agent.authenticate()` | Performs OAuth 2.0 client-credentials flow |
| `@ai_function` | Decorates annotated Python functions as framework tools |
| `has_capability(...)` | Guards tool execution with LumoAuth capability checks |
| `get_mcp_token(...)` | Exchanges the agent token for an MCP-specific token (RFC 8693) |

## Next Steps

- [Agent Registry overview](./registry) - manage agent registrations, budgets, and capabilities
- [AAuth Quick Start](./aauth-quickstart) - add cryptographic agent identity
