---
sidebar_label: CrewAI
---

# Agent Registry – CrewAI

Integrate a LumoAuth-registered agent with **CrewAI** to authenticate,
enforce budget policies, and perform token exchange for secured MCP servers.

:::info[Prerequisites]
Install the `lumoauth` package and set the environment variables
`LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, and
`AGENT_CLIENT_SECRET`. See [Install the SDK](./registry#install-sdk).
:::

## Install

```bash
pip install lumoauth crewai crewai-tools
```

## Example

```python
from crewai import Agent, Task, Crew
from crewai.tools import tool
from lumoauth import LumoAuthAgent

# 1. Initialize and authenticate the LumoAuth Agent
lumo_agent = LumoAuthAgent()
lumo_agent.authenticate()

# 2. Define tools that check LumoAuth capabilities
@tool
def search_company_documents(query: str) -> str:
    """Search internal company documents for the given query."""
    if not lumo_agent.has_capability('read:documents'):
        return "Error: Agent lacks 'read:documents' capability."
    return f"Found 3 documents matching '{query}'"

@tool
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

# 4. Create CrewAI agents and tasks
researcher = Agent(
    role="Research Analyst",
    goal="Find relevant company documents and financial metrics",
    backstory="You are a senior analyst at a financial firm.",
    tools=[search_company_documents, query_financial_mcp],
    verbose=True,
)

research_task = Task(
    description="Search documents for Q3 performance, then query the financial MCP for EBITDA.",
    expected_output="A summary of Q3 performance with EBITDA figures.",
    agent=researcher,
)

# 5. Assemble and run the Crew
crew = Crew(agents=[researcher], tasks=[research_task], verbose=True)
result = crew.kickoff()
print(result)
```

## How It Works

| Step | What happens |
|------|-------------|
| `LumoAuthAgent()` | Reads credentials from env vars and initialises the client |
| `lumo_agent.authenticate()` | Performs OAuth 2.0 client-credentials flow |
| `has_capability(...)` | Guards tool execution with LumoAuth capability checks |
| `get_mcp_token(...)` | Exchanges the agent token for an MCP-specific token (RFC 8693) |
| `is_budget_exhausted()` | Prevents the Crew run if the agent's daily budget is used up |

## Next Steps

- [Agent Registry overview](./registry) - manage agent registrations, budgets, and capabilities
- [JIT Permissions – CrewAI](./jit-crewai) - add just-in-time permission escalation
