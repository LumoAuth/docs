---
sidebar_label: CrewAI
---

# AAuth Quick Start – CrewAI

Integrate the AAuth protocol into a **CrewAI** agent so that every tool call
carries a cryptographically-signed identity via HTTP Message Signatures.

:::info[Prerequisites]
- LumoAuth tenant with AAuth enabled
- Python 3.9+

Complete [Steps 1–3](./aauth-quickstart): generate key pair, register agent and resource. Verify your setup with the [Python SDK quickstart](./aauth-qs-python) first.
:::

## Install

```bash
pip install lumoauth[aauth] crewai crewai-tools
```

## Example

```python
from crewai import Agent, Task, Crew
from crewai.tools import tool
from lumoauth.aauth import AAuthClient

# 1. Initialize the AAuth client
private_pem, jwks = AAuthClient.generate_keypair()
aauth = AAuthClient(
    agent_identifier="https://my-agent.example.com",
    private_key_pem=private_pem,
    tenant="acme-corp",
)

# 2. Obtain tokens upfront (resource token from your resource server)
resource_token = "..."
tokens = aauth.request_authorization(resource_token=resource_token, scope="read write")
if tokens.get("authorization_required"):
    raise RuntimeError("User consent required — implement OAuth redirect flow first")

ACCESS_TOKEN = tokens["access_token"]

# 3. Define tools that make AAuth-signed API calls
@tool
def fetch_financial_report(quarter: str) -> str:
    """Fetch a quarterly financial report from the protected API."""
    resp = aauth.signed_request(
        "GET",
        f"https://api.example.com/v1/reports/{quarter}",
        auth_token=ACCESS_TOKEN,
    )
    if resp.status_code == 200:
        return resp.text
    return f"Error: HTTP {resp.status_code}"

@tool
def submit_analysis(summary: str) -> str:
    """Submit a financial analysis to the protected API."""
    resp = aauth.signed_request(
        "POST",
        "https://api.example.com/v1/analyses",
        auth_token=ACCESS_TOKEN,
        json={"summary": summary},
    )
    if resp.status_code in (200, 201):
        return "Analysis submitted successfully."
    return f"Error: HTTP {resp.status_code}"

# 4. Set up and run the CrewAI crew
analyst = Agent(
    role="Financial Analyst",
    goal="Retrieve Q4 financial data and submit a concise analysis",
    backstory="You are an expert financial analyst with access to protected APIs.",
    tools=[fetch_financial_report, submit_analysis],
    verbose=True,
)

analysis_task = Task(
    description="Fetch the Q4-2024 financial report and submit a two-sentence analysis.",
    expected_output="Confirmation that the analysis was submitted.",
    agent=analyst,
)

crew = Crew(agents=[analyst], tasks=[analysis_task], verbose=True)
result = crew.kickoff()
print(result)
```

## How It Works

| Component | Role |
|-----------|------|
| `AAuthClient` | Manages key material and handles AAuth token exchange |
| `aauth.signed_request(...)` | Adds `Agent-Auth` (RFC 9421) and `Authorization` headers to every API call |
| `ACCESS_TOKEN` | Short-lived token issued after validating agent + resource identities |
| CrewAI Crew | Orchestrates agents and tasks; AAuth handles auth transparently |

## Next Steps

- [AAuth Protocol spec](./aauth) — deep dive into the protocol
- [JIT Permissions – CrewAI](./jit-crewai) — add per-operation permission escalation
