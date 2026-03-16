---
sidebar_label: Google ADK
---

# JIT Permissions – Google ADK

Integrate LumoAuth's Just-in-Time permission system into a **Google Agent
Development Kit (ADK)** agent so that tools automatically request scoped JIT
access when they encounter a permission error.

:::info[Prerequisites]
Install the `lumoauth` package and set the environment variables
`LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, and
`AGENT_CLIENT_SECRET`. See [JIT Permissions](./jit) for an overview.
:::

## Install

```bash
pip install lumoauth google-adk
```

## Example

```python
import asyncio
import json
import base64
import requests as req
from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from lumoauth import LumoAuthAgent
from lumoauth.jit import JITContext

# 1. Authenticate and create JIT context
agent_auth = LumoAuthAgent()
agent_auth.authenticate()
jit = JITContext(agent_auth)
jit.create_task(name="ADK document analysis task")


def _jit_request(url: str, method: str = "GET", payload: dict = None) -> dict:
    """Helper: make a request with automatic JIT escalation on 403."""
    kwargs = {"headers": {"Authorization": f"Bearer {agent_auth.access_token}"}}
    if payload:
        kwargs["json"] = payload
        kwargs["headers"]["Content-Type"] = "application/json"

    resp = req.request(method, url, **kwargs)

    if resp.status_code == 403:
        header = resp.headers.get("Insufficient-Authorization-Details")
        if header:
            required = json.loads(base64.b64decode(header))
            jit_result = jit.request_permission(
                required,
                justification=f"{method} {url}",
            )
            if jit_result.get("status") == "approved":
                jit_token = jit.get_token(jit_result["request_id"])
                kwargs["headers"]["Authorization"] = f"Bearer {jit_token}"
                retry = req.request(method, url, **kwargs)
                return {"result": retry.text} if retry.status_code in (200, 201) \
                    else {"error": f"Retry HTTP {retry.status_code}"}
            return {"error": f"JIT denied: {jit_result.get('status')}"}

    return {"result": resp.text} if resp.status_code in (200, 201) \
        else {"error": f"HTTP {resp.status_code}"}


# 2. Define ADK tool functions
def fetch_document(document_id: str) -> dict:
    """Fetch a sensitive document from the protected API.
    Automatically escalates permissions via JIT if the request is denied."""
    return _jit_request(f"https://api.acme-corp.com/v1/documents/{document_id}")


def create_report(title: str, content: str) -> dict:
    """Create a report via the protected API.
    Automatically escalates permissions via JIT if the request is denied."""
    return _jit_request(
        "https://api.acme-corp.com/v1/reports",
        method="POST",
        payload={"title": title, "content": content},
    )


# 3. Build the ADK agent
analyst_agent = Agent(
    name="protected_data_analyst",
    model="gemini-2.0-flash",
    description="Fetches protected documents and creates reports using JIT-scoped access.",
    instruction=(
        "You are a senior analyst. Fetch requested documents and create concise reports. "
        "The tools will automatically handle permission escalation."
    ),
    tools=[
        FunctionTool(fetch_document),
        FunctionTool(create_report),
    ],
)


# 4. Run the agent
async def main():
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name="protected_data_analyst", user_id="analyst_user"
    )

    runner = Runner(
        agent=analyst_agent,
        app_name="protected_data_analyst",
        session_service=session_service,
    )
    content = types.Content(
        role="user",
        parts=[types.Part.from_text(
            "Fetch document doc_9982, summarize it, and create a report titled 'Q4 Analysis'."
        )],
    )

    try:
        async for event in runner.run_async(
            user_id="analyst_user",
            session_id=session.id,
            new_message=content,
        ):
            if event.is_final_response():
                for part in event.content.parts:
                    print(part.text)
    finally:
        # Always cleanup — revokes all JIT tokens for this task
        jit.complete_task()


if __name__ == "__main__":
    asyncio.run(main())
```

## How It Works

| Component | Role |
|-----------|------|
| `JITContext` | Manages the ephemeral task, JIT requests, and cleanup |
| `_jit_request(...)` | Shared helper that handles the 403 → JIT request → retry pattern |
| `FunctionTool(...)` | Wraps plain Python functions as ADK tools |
| `jit.complete_task()` | Revokes all JIT tokens (called in `finally`) |

## Next Steps

- [JIT Permissions overview](./jit) — core concepts, API reference, and best practices
- [Agent Registry – Google ADK](./registry-google-adk) — set up agent authentication first
