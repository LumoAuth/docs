---
sidebar_label: CrewAI
---

# JIT Permissions – CrewAI

Integrate LumoAuth's Just-in-Time permission system into a **CrewAI** workflow
so that agents automatically request JIT access to protected resources during
task execution.

:::info[Prerequisites]
Install the `lumoauth` package and set the environment variables
`LUMOAUTH_URL`, `LUMOAUTH_TENANT`, `AGENT_CLIENT_ID`, and
`AGENT_CLIENT_SECRET`. See [JIT Permissions](./jit) for an overview.
:::

## Install

```bash
pip install lumoauth crewai crewai-tools
```

## Example

```python
import json
import base64
import requests as req
from crewai import Agent, Task, Crew
from crewai.tools import tool

from lumoauth import LumoAuthAgent
from lumoauth.jit import JITContext

# 1. Authenticate and create JIT context
agent_auth = LumoAuthAgent()
agent_auth.authenticate()
jit = JITContext(agent_auth)
jit.create_task(name="CrewAI document analysis")


# 2. Tools with automatic JIT escalation
@tool
def fetch_sensitive_document(document_id: str) -> str:
    """Fetch a sensitive document from the protected API.
    Returns an error with required permissions if access is denied."""
    url = f"https://api.acme-corp.com/v1/documents/{document_id}"
    resp = req.get(url, headers={"Authorization": f"Bearer {agent_auth.access_token}"})

    if resp.status_code == 403:
        header = resp.headers.get("Insufficient-Authorization-Details")
        if header:
            required = json.loads(base64.b64decode(header))
            # Request JIT permission automatically
            jit_result = jit.request_permission(
                required,
                justification=f"Need to read document {document_id} for user query",
            )
            if jit_result.get("status") == "approved":
                jit_token = jit.get_token(jit_result["request_id"])
                # Retry with JIT token
                retry = req.get(url, headers={"Authorization": f"Bearer {jit_token}"})
                if retry.status_code == 200:
                    return retry.text
                return f"Retry failed: HTTP {retry.status_code}"
            return f"JIT permission denied: {jit_result.get('status')}"

    if resp.status_code == 200:
        return resp.text
    return f"Error: HTTP {resp.status_code}"


@tool
def write_analysis_report(content: str) -> str:
    """Write an analysis report to the protected API."""
    url = "https://api.acme-corp.com/v1/reports"
    resp = req.post(
        url,
        headers={"Authorization": f"Bearer {agent_auth.access_token}",
                 "Content-Type": "application/json"},
        json={"content": content},
    )
    if resp.status_code in (200, 201):
        return "Report created successfully."
    # Self-correcting JIT escalation for write operations
    if resp.status_code == 403:
        header = resp.headers.get("Insufficient-Authorization-Details")
        if header:
            required = json.loads(base64.b64decode(header))
            jit_result = jit.request_permission(
                required,
                justification="Writing analysis report for completed task",
            )
            if jit_result.get("status") == "approved":
                jit_token = jit.get_token(jit_result["request_id"])
                retry = req.post(
                    url,
                    headers={"Authorization": f"Bearer {jit_token}",
                             "Content-Type": "application/json"},
                    json={"content": content},
                )
                return "Report created successfully." if retry.status_code in (200, 201) \
                    else f"Retry failed: HTTP {retry.status_code}"
    return f"Error: HTTP {resp.status_code}"


# 3. Set up CrewAI agents and tasks
analyst = Agent(
    role="Senior Analyst",
    goal="Retrieve and analyze confidential documents, then produce a report",
    backstory="You are a senior analyst with access to protected company systems.",
    tools=[fetch_sensitive_document, write_analysis_report],
    verbose=True,
)

analysis_task = Task(
    description=(
        "Fetch document doc_9982, analyze its contents, "
        "and write a concise analysis report."
    ),
    expected_output="Confirmation that the analysis report was saved.",
    agent=analyst,
)

crew = Crew(agents=[analyst], tasks=[analysis_task], verbose=True)

try:
    result = crew.kickoff()
    print(result)
finally:
    # Always cleanup - revokes all JIT tokens for this task
    jit.complete_task()
```

## How It Works

| Component | Role |
|-----------|------|
| `JITContext` | Manages the ephemeral task, JIT requests, and automatic cleanup |
| `Insufficient-Authorization-Details` header | Resource server signals exactly what permission is needed |
| `jit.request_permission(...)` | Requests a short-lived, scoped JIT token from LumoAuth |
| `jit.complete_task()` | Called in `finally` to revoke all outstanding JIT tokens |

## Next Steps

- [JIT Permissions overview](./jit) - core concepts, API reference, and best practices
- [Agent Registry – CrewAI](./registry-crewai) - set up agent authentication first
