---
sidebar_label: Python SDK
---

# AAuth Quick Start – Python SDK

Get your Python agent authenticated using the AAuth protocol in minutes.

:::info[Prerequisites]
- LumoAuth tenant with AAuth enabled
- Python 3.9+ installed

Complete [Steps 1–3](./aauth-quickstart) first: generate your key pair, register your agent, and register a resource.
:::

## Install

```bash
pip install lumoauth[aauth]
```

## Quick Start

```python
from lumoauth.aauth import AAuthClient

# Generate a key pair (one-time) - or load an existing private key
private_pem, jwks = AAuthClient.generate_keypair()
# Register the **jwks** with LumoAuth in the portal, then:

client = AAuthClient(
    agent_identifier="https://my-agent.example.com",
    private_key_pem=private_pem,      # or open("agent-key.pem").read()
    tenant="acme-corp",
)

# Assume you already have a resource_token from the resource server
resource_token = "..."

# Request authorisation (direct flow - no user interaction)
tokens = client.request_authorization(resource_token=resource_token, scope="read write")

if tokens.get("authorization_required"):
    # User consent needed - redirect the user
    print("Redirect user to:", tokens["auth_url"])
    # After the user approves, exchange the code:
    #   tokens = client.exchange_code(code, tokens["request_token"])
else:
    # Access the protected resource with a signed request
    resp = client.signed_request(
        "GET",
        "https://api.example.com/v1/data",
        auth_token=tokens["access_token"],
    )
    print(resp.json())
```

## Key Points

| Step | What happens |
|------|-------------|
| `AAuthClient.generate_keypair()` | Generates an Ed25519 key pair; register the JWKS in the portal |
| `request_authorization(...)` | Sends a signed Agent Auth request; may return `authorization_required` for user-consent flows |
| `client.signed_request(...)` | Signs outgoing HTTP requests with RFC 9421 Message Signatures |

## Handling User Consent

When `authorization_required` is `True`, redirect the user to `auth_url`. After the user approves, the browser is redirected back with a `code` parameter:

```python
# Exchange the authorization code for tokens
tokens = client.exchange_code(code=received_code, request_token=tokens["request_token"])
resp = client.signed_request("GET", "https://api.example.com/v1/data",
                             auth_token=tokens["access_token"])
```

## Next Steps

- [AAuth Protocol spec](./aauth) - full technical details
- [AAuth Quick Start – LangChain](./aauth-qs-langchain) - use AAuth inside a LangGraph agent
