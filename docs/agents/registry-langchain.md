---
sidebar_label: LangChain / LangGraph
---

# Agent Registry – LangChain / LangGraph

Integrate a LumoAuth-registered agent with **LangChain** and **LangGraph**
to authenticate, enforce budget policies, and perform token exchange for
secured MCP servers.

:::info[Prerequisites]
Install the `lumoauth` package and set the environment variables
`LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, and
`AGENT_CLIENT_SECRET`. See [Install the SDK](./registry#install-sdk).
:::

## Install

```bash
pip install lumoauth langchain-openai langgraph
```

## Example

```python
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from lumoauth import LumoAuthAgent

# 1. Initialize and authenticate the LumoAuth Agent
lumo_agent = LumoAuthAgent()
lumo_agent.authenticate()

# 2. Define tools that check LumoAuth capabilities
@tool
def search_company_documents(query: str) -> str:
    """Search internal company documents."""
    if not lumo_agent.has_capability('read:documents'):
        return "Error: Agent lacks 'read:documents' capability."
    return f"Found 3 documents matching '{query}'"

@tool
def query_financial_mcp(metric: str) -> str:
    """Query the secured financial metrics MCP server."""
    if not lumo_agent.has_capability('mcp:financial'):
        return "Error: Agent lacks 'mcp:financial' capability."
    mcp_token = lumo_agent.get_mcp_token("urn:mcp:financial-data")
    if not mcp_token:
        return "Error: Failed to obtain token for Financial MCP server."
    return f"Retrieved {metric}: $1.2M (Authenticated via MCP Token Exchange)"

# 3. Create the LangGraph ReAct Agent
tools = [search_company_documents, query_financial_mcp]
llm = ChatOpenAI(model="gpt-4", temperature=0)
agent_executor = create_react_agent(llm, tools)

# 4. Run the graph
def run_agent_workflow(user_query: str):
    if lumo_agent.is_budget_exhausted():
        print("Agent budget exhausted for today.")
        return

    events = agent_executor.stream(
        {"messages": [("user", user_query)]},
        stream_mode="values",
    )
    for event in events:
        event["messages"][-1].pretty_print()

if __name__ == "__main__":
    run_agent_workflow("Search documents for Q3 performance, then query the financial MCP for EBITDA.")
```

## How It Works

| Step | What happens |
|------|-------------|
| `LumoAuthAgent()` | Reads credentials from env vars and initialises the client |
| `lumo_agent.authenticate()` | Performs OAuth 2.0 client-credentials flow |
| `has_capability(...)` | Guards tool execution with LumoAuth capability checks |
| `get_mcp_token(...)` | Exchanges the agent token for an MCP-specific token (RFC 8693) |
| `is_budget_exhausted()` | Prevents the LangGraph run if the agent's daily budget is used up |

## Next Steps

- [Agent Registry overview](./registry) — manage agent registrations, budgets, and capabilities
- [JIT Permissions – LangGraph](./jit-langgraph) — add just-in-time permission escalation
