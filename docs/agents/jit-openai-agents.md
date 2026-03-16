---
sidebar_label: OpenAI Agents SDK
---

# JIT Permissions – OpenAI Agents SDK

Integrate LumoAuth's Just-in-Time permission system into an **OpenAI Agents SDK**
agent so that tools can automatically request and use JIT-scoped tokens when
they encounter a permission error.

:::info[Prerequisites]
Install the `lumoauth` package and set the environment variables
`LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, and
`AGENT_CLIENT_SECRET`. See [JIT Permissions](./jit) for an overview.
:::

## Install

```bash
pip install lumoauth openai-agents
```

## Example

```python
import asyncio
import json
import base64
import requests as req
from agents import Agent, Runner, function_tool

from lumoauth import LumoAuthAgent
from lumoauth.jit import JITContext

# 1. Authenticate and create JIT context
agent_auth = LumoAuthAgent()
agent_auth.authenticate()
jit = JITContext(agent_auth)
jit.create_task(name="OpenAI Agents document task")


# 2. Tools with automatic JIT escalation
@function_tool
def fetch_protected_document(document_id: str) -> str:
    """Fetch a sensitive document from the protected API.
    Automatically requests JIT access if permissions are missing."""
    url = f"https://api.acme-corp.com/v1/documents/{document_id}"
    resp = req.get(url, headers={"Authorization": f"Bearer {agent_auth.access_token}"})

    if resp.status_code == 403:
        header = resp.headers.get("Insufficient-Authorization-Details")
        if header:
            required = json.loads(base64.b64decode(header))
            jit_result = jit.request_permission(
                required,
                justification=f"Fetching document {document_id} for user query",
            )
            if jit_result.get("status") == "approved":
                jit_token = jit.get_token(jit_result["request_id"])
                retry = req.get(url, headers={"Authorization": f"Bearer {jit_token}"})
                return retry.text if retry.status_code == 200 \
                    else f"Retry failed: HTTP {retry.status_code}"
            return f"JIT permission denied: {jit_result.get('status')}"

    return resp.text if resp.status_code == 200 else f"Error: HTTP {resp.status_code}"


@function_tool
def summarize_and_save(document_id: str, summary: str) -> str:
    """Save a summary for a document. Requests JIT write access if needed."""
    url = f"https://api.acme-corp.com/v1/documents/{document_id}/summaries"
    resp = req.post(
        url,
        headers={"Authorization": f"Bearer {agent_auth.access_token}",
                 "Content-Type": "application/json"},
        json={"text": summary},
    )

    if resp.status_code in (200, 201):
        return "Summary saved."

    if resp.status_code == 403:
        header = resp.headers.get("Insufficient-Authorization-Details")
        if header:
            required = json.loads(base64.b64decode(header))
            jit_result = jit.request_permission(
                required,
                justification=f"Saving summary for document {document_id}",
            )
            if jit_result.get("status") == "approved":
                jit_token = jit.get_token(jit_result["request_id"])
                retry = req.post(
                    url,
                    headers={"Authorization": f"Bearer {jit_token}",
                             "Content-Type": "application/json"},
                    json={"text": summary},
                )
                return "Summary saved." if retry.status_code in (200, 201) \
                    else f"Retry failed: HTTP {retry.status_code}"

    return f"Error: HTTP {resp.status_code}"


# 3. Create the OpenAI Agent
doc_agent = Agent(
    name="Document Analyst",
    instructions=(
        "You are a helpful analyst. Fetch documents and produce concise summaries. "
        "If a tool returns a permission error, retry after JIT access is granted."
    ),
    tools=[fetch_protected_document, summarize_and_save],
)


# 4. Run the agent
async def main():
    try:
        result = await Runner.run(
            doc_agent,
            "Fetch document doc_9982, summarize it in two sentences, and save the summary.",
        )
        print(result.final_output)
    finally:
        # Always cleanup
        jit.complete_task()


if __name__ == "__main__":
    asyncio.run(main())
```

## How It Works

| Component | Role |
|-----------|------|
| `JITContext` | Manages the ephemeral task, JIT requests, and automatic cleanup |
| `@function_tool` | Decorates Python functions as OpenAI SDK tools |
| `Insufficient-Authorization-Details` | Resource server signals the exact permission needed |
| `jit.request_permission(...)` | Requests a short-lived, scoped JIT token |
| `jit.complete_task()` | Revokes all outstanding JIT tokens (called in `finally`) |

## Next Steps

- [JIT Permissions overview](./jit) — core concepts, API reference, and best practices
- [Agent Registry – OpenAI Agents SDK](./registry-openai-agents) — set up agent authentication first
