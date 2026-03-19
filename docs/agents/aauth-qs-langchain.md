---
sidebar_label: LangChain / LangGraph
---

# AAuth Quick Start – LangChain / LangGraph

Integrate the AAuth protocol into a **LangGraph** ReAct agent so that every
tool call carries cryptographic proof-of-identity via HTTP Message Signatures.

:::info[Prerequisites]
- LumoAuth tenant with AAuth enabled
- Python 3.9+

Complete [Steps 1–3](./aauth-quickstart): generate key pair, register agent and resource. Then follow the [Python SDK quickstart](./aauth-qs-python) to verify your setup before wiring it into LangGraph.
:::

## Install

```bash
pip install lumoauth[aauth] langchain-openai langgraph
```

## Example

```python
import asyncio
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
from lumoauth.aauth import AAuthClient

# 1. Initialize the AAuth client (load existing key from file in production)
private_pem, jwks = AAuthClient.generate_keypair()
aauth = AAuthClient(
    agent_identifier="https://my-agent.example.com",
    private_key_pem=private_pem,
    tenant="acme-corp",
)

# 2. Obtain a resource token (in production, fetched at task start)
resource_token = "..."  # from your resource server

# 3. Request authorization upfront
tokens = aauth.request_authorization(resource_token=resource_token, scope="read write")
if tokens.get("authorization_required"):
    raise RuntimeError("User consent required - implement OAuth redirect flow first")

ACCESS_TOKEN = tokens["access_token"]

# 4. Define tools that use the AAuth-issued access token
@tool
def fetch_protected_data(endpoint: str) -> str:
    """Fetch data from the protected API using an AAuth-signed request."""
    resp = aauth.signed_request(
        "GET",
        f"https://api.example.com{endpoint}",
        auth_token=ACCESS_TOKEN,
    )
    if resp.status_code == 200:
        return resp.text
    return f"Error: HTTP {resp.status_code}"

@tool
def submit_report(payload: str) -> str:
    """Submit a report to the protected API."""
    resp = aauth.signed_request(
        "POST",
        "https://api.example.com/v1/reports",
        auth_token=ACCESS_TOKEN,
        json={"data": payload},
    )
    if resp.status_code in (200, 201):
        return "Report submitted successfully."
    return f"Error: HTTP {resp.status_code}"

# 5. Create and run the LangGraph ReAct agent
tools = [fetch_protected_data, submit_report]
llm = ChatOpenAI(model="gpt-4", temperature=0)
agent_executor = create_react_agent(llm, tools)

def run(query: str):
    events = agent_executor.stream(
        {"messages": [("user", query)]},
        stream_mode="values",
    )
    for event in events:
        event["messages"][-1].pretty_print()

if __name__ == "__main__":
    run("Fetch /v1/reports/q4-2024 and then submit a summary as a new report.")
```

## How It Works

| Component | Role |
|-----------|------|
| `AAuthClient` | Manages key material, signs requests, and handles token exchange |
| `aauth.signed_request(...)` | Wraps `requests` and adds an `Agent-Auth` header per RFC 9421 |
| `ACCESS_TOKEN` | Short-lived token issued by LumoAuth after agent + resource auth |
| LangGraph ReAct loop | Lets the LLM decide which tools to call, AAuth handles auth transparently |

## Next Steps

- [AAuth Protocol spec](./aauth) - deep dive into the protocol
- [JIT Permissions – LangGraph](./jit-langgraph) - add per-operation permission escalation
