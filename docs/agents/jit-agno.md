---
sidebar_label: Agno
---

# JIT Permissions – Agno

Integrate LumoAuth's Just-in-Time permission system into an **Agno** agent so
that tools automatically request scoped JIT access when they encounter a
permission error.

:::info[Prerequisites]
Install the `lumoauth` package and set the environment variables
`LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, and
`AGENT_CLIENT_SECRET`. See [JIT Permissions](./jit) for an overview.
:::

## Install

```bash
pip install lumoauth agno openai
```

## Example

```python
import json
import base64
import requests as req
from agno.agent import Agent
from agno.tools import tool
from agno.models.openai import OpenAIChat

from lumoauth import LumoAuthAgent
from lumoauth.jit import JITContext

# 1. Authenticate and create JIT context
agent_auth = LumoAuthAgent()
agent_auth.authenticate()
jit = JITContext(agent_auth)
jit.create_task(name="Agno document analysis task")


def _jit_get(url: str) -> str:
    """Helper: GET with automatic JIT escalation."""
    resp = req.get(url, headers={"Authorization": f"Bearer {agent_auth.access_token}"})

    if resp.status_code == 403:
        header = resp.headers.get("Insufficient-Authorization-Details")
        if header:
            required = json.loads(base64.b64decode(header))
            jit_result = jit.request_permission(
                required,
                justification=f"Accessing {url}",
            )
            if jit_result.get("status") == "approved":
                jit_token = jit.get_token(jit_result["request_id"])
                retry = req.get(url, headers={"Authorization": f"Bearer {jit_token}"})
                return retry.text if retry.status_code == 200 \
                    else f"Retry error: HTTP {retry.status_code}"
            return f"JIT denied: {jit_result.get('status')}"

    return resp.text if resp.status_code == 200 else f"Error: HTTP {resp.status_code}"


# 2. Define tools
@tool
def fetch_document(document_id: str) -> str:
    """Fetch a sensitive document from the protected API.
    Automatically requests JIT access if the initial request is denied."""
    return _jit_get(f"https://api.acme-corp.com/v1/documents/{document_id}")


@tool
def fetch_financial_summary(report_id: str) -> str:
    """Fetch a financial summary from the protected reporting API.
    Automatically requests JIT access if the initial request is denied."""
    return _jit_get(f"https://api.acme-corp.com/v1/reports/{report_id}/summary")


# 3. Create and run the Agno agent
agno_agent = Agent(
    name="Protected Data Analyst",
    model=OpenAIChat(id="gpt-4"),
    tools=[fetch_document, fetch_financial_summary],
    instructions=[
        "You are a senior analyst with access to protected APIs.",
        "Fetch documents and financial summaries as requested.",
        "If a tool indicates a permission error, the system will auto-escalate.",
    ],
    markdown=True,
)

try:
    agno_agent.print_response(
        "Fetch document doc_9982 and the financial summary for report FY2024-Q4, "
        "then provide a combined executive summary."
    )
finally:
    # Always cleanup - revokes all JIT tokens for this task
    jit.complete_task()
```

## How It Works

| Component | Role |
|-----------|------|
| `JITContext` | Manages the ephemeral task, JIT requests, and cleanup |
| `_jit_get(...)` | Shared helper that handles the 403 → JIT request → retry pattern |
| `@tool` | Wraps functions as Agno-compatible tools |
| `jit.complete_task()` | Revokes all JIT tokens when called (in `finally`) |

## Next Steps

- [JIT Permissions overview](./jit) - core concepts, API reference, and best practices
- [Agent Registry – Agno](./registry-agno) - set up agent authentication first
