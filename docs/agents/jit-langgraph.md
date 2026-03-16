---
sidebar_label: LangChain / LangGraph
---

# JIT Permissions – LangChain / LangGraph

Integrate LumoAuth's Just-in-Time permission system into a **LangGraph** agent.
By leveraging LangGraph's tool-calling loop, the agent can automatically request
JIT access when it encounters an `Insufficient-Authorization-Details` error and
transparently retry.

:::info[Prerequisites]
Install the `lumoauth` package and set the environment variables
`LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, and
`AGENT_CLIENT_SECRET`. See [JIT Permissions](./jit) for an overview.
:::

## Install

```bash
pip install lumoauth langgraph langchain-openai
```

## Example

```python
import os
import json
import base64
from typing import Dict, Annotated
from typing_extensions import TypedDict

from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langchain_core.messages import ToolMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages

from lumoauth import LumoAuthAgent
from lumoauth.jit import JITContext

# Authenticate the agent and create a JIT context
agent = LumoAuthAgent()
agent.authenticate()
jit = JITContext(agent)
jit.create_task(name="LangGraph document analysis")


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    jit_tokens: Dict[str, str]


@tool
def fetch_protected_document(document_id: str, jit_token: str = None) -> str:
    """Fetch a sensitive document. If you lack permissions you will receive
    the required authorization_details in the error response."""
    import requests

    url = f"https://api.acme-corp.com/v1/documents/{document_id}"
    token = jit_token or agent.access_token
    resp = requests.get(url, headers={"Authorization": f"Bearer {token}"})

    if resp.status_code == 403:
        header = resp.headers.get("Insufficient-Authorization-Details")
        if header:
            required = json.loads(base64.b64decode(header))
            return json.dumps(
                {"error": "Insufficient JIT permissions",
                 "required_authorization_details": required}
            )
    if resp.status_code == 200:
        return resp.text
    return f"Error: HTTP {resp.status_code}"


@tool
def request_jit_access(
    required_authorization_details_json: str,
    justification: str,
) -> str:
    """Request Just-In-Time access. Pass the exact
    required_authorization_details JSON from the failing tool."""
    authz = json.loads(required_authorization_details_json)
    result = jit.request_permission(authz, justification=justification)

    if result.get("status") == "approved":
        token = jit.get_token(result["request_id"])
        return json.dumps({"status": "success", "jit_token": token})
    return f"Access request failed/denied: {result.get('status')}"


tools = [fetch_protected_document, request_jit_access]
llm = ChatOpenAI(model="gpt-4", temperature=0).bind_tools(tools)


def agent_node(state: AgentState):
    return {"messages": [llm.invoke(state["messages"])]}


def execute_tools(state: AgentState):
    last = state["messages"][-1]
    responses, new_tokens = [], dict(state.get("jit_tokens", {}))

    for tc in last.tool_calls:
        args = dict(tc["args"])
        if tc["name"] == "fetch_protected_document" and "latest" in new_tokens:
            args["jit_token"] = new_tokens["latest"]

        matched = next((t for t in tools if t.name == tc["name"]), None)
        result = matched.invoke(args) if matched else "Unknown tool"

        if tc["name"] == "request_jit_access":
            try:
                parsed = json.loads(result)
                if parsed.get("status") == "success":
                    new_tokens["latest"] = parsed["jit_token"]
                    result = "Access granted. Please retry the previous tool call."
            except json.JSONDecodeError:
                pass

        responses.append(ToolMessage(content=str(result), tool_call_id=tc["id"]))

    return {"messages": responses, "jit_tokens": new_tokens}


def should_continue(state: AgentState):
    return "tools" if state["messages"][-1].tool_calls else END


graph = StateGraph(AgentState)
graph.add_node("agent", agent_node)
graph.add_node("tools", execute_tools)
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue, ["tools", END])
graph.add_edge("tools", "agent")
app = graph.compile()

if __name__ == "__main__":
    for event in app.stream(
        {"messages": [("user", "Summarize the confidential report doc_9982")],
         "jit_tokens": {}},
        stream_mode="values",
    ):
        event["messages"][-1].pretty_print()

    # Cleanup — revokes all JIT tokens for this task
    jit.complete_task()
```

## How It Works

| Component | Role |
|-----------|------|
| `JITContext` | Manages the ephemeral task, JIT requests, and automatic cleanup |
| `fetch_protected_document` | Detects `Insufficient-Authorization-Details` (403) and surfaces the needed permissions |
| `request_jit_access` | Calls `jit.request_permission(...)` and caches the resulting short-lived token |
| LangGraph tool loop | Lets the LLM self-correct: fetch → detect 403 → request JIT → retry |
| `jit.complete_task()` | Revokes all outstanding JIT tokens when the task is done |

## Next Steps

- [JIT Permissions overview](./jit) — core concepts, API reference, and best practices
- [Agent Registry – LangChain](./registry-langchain) — set up agent authentication first
