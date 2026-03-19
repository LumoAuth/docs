---
sidebar_label: OpenAI Agents SDK
---

# Agent Registry – OpenAI Agents SDK

Integrate a LumoAuth-registered agent with the **OpenAI Agents SDK**
to authenticate, enforce budget policies, and perform token exchange for
secured MCP servers.

:::info[Prerequisites]
Install the `lumoauth` package and set the environment variables
`LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, and
`AGENT_CLIENT_SECRET`. See [Install the SDK](./registry#install-sdk).
:::

## Install

```bash
pip install lumoauth openai-agents
```

## Example

```python
import asyncio
from agents import Agent, Runner, function_tool
from lumoauth import LumoAuthAgent

# 1. Initialize and authenticate the LumoAuth Agent
lumo_agent = LumoAuthAgent()
lumo_agent.authenticate()

# 2. Define tools that check LumoAuth capabilities
@function_tool
def search_company_documents(query: str) -> str:
    """Search internal company documents for the given query."""
    if not lumo_agent.has_capability('read:documents'):
        return "Error: Agent lacks 'read:documents' capability."
    return f"Found 3 documents matching '{query}'"

@function_tool
def query_financial_mcp(metric: str) -> str:
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

# 4. Create the OpenAI Agent
research_agent = Agent(
    name="Research Analyst",
    instructions="You are a senior analyst. Use tools to search documents and query financial metrics.",
    tools=[search_company_documents, query_financial_mcp],
)

# 5. Run the agent
async def main():
    result = await Runner.run(
        research_agent,
        "Search documents for Q3 performance, then query the financial MCP for EBITDA.",
    )
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

## How It Works

| Step | What happens |
|------|-------------|
| `LumoAuthAgent()` | Reads credentials from env vars and initialises the client |
| `lumo_agent.authenticate()` | Performs OAuth 2.0 client-credentials flow |
| `@function_tool` | Decorates plain Python functions as OpenAI SDK tools |
| `has_capability(...)` | Guards tool execution with LumoAuth capability checks |
| `get_mcp_token(...)` | Exchanges the agent token for an MCP-specific token (RFC 8693) |

## Next Steps

- [Agent Registry overview](./registry) - manage agent registrations, budgets, and capabilities
- [JIT Permissions – OpenAI Agents SDK](./jit-openai-agents) - add just-in-time permission escalation
