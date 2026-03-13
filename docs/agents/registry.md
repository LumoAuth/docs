# Agent Registry

Register AI agents in LumoAuth to give them their own identity, capabilities, and usage limits. 
    Registered agents can authenticate and be tracked separately from users.

## Creating an Agent

Agents are typically created through the LumoAuth dashboard, but can also be created 
    programmatically. Each agent has:

| Property | Description |
| --- | --- |
| **Name** | Human-readable identifier (e.g., "Research Assistant Bot") |
| **Client ID** | Unique identifier used for OAuth authentication |
| **Client Secret** | Secret key for authentication (optional if using workload identity) |
| **Capabilities** | Scopes/permissions the agent is allowed to request |
| **Budget Policy** | Usage limits (API calls, tokens consumed, etc.) |
| **Identity Type** | How the agent authenticates (Workload Identity, AAuth, API Key, Client Credentials, Custom) |
| **Workload Identity** | External identity sources (Kubernetes, AWS, GCP) for cloud-native deployments |
| **AAuth Identity** | Agent Auth Protocol with cryptographic identity and proof-of-possession tokens |

## Agent vs OAuth Client

While agents use OAuth 2.0 for authentication, they have additional properties:

| Feature | Standard OAuth Client | Agent |
| --- | --- | --- |
| Authentication | Client credentials | Client credentials, workload identity, or AAuth protocol |
| Identity Type | Application | AI Agent |
| Usage Limits | Rate limiting only | Budget policies (tokens, API calls, costs) |
| Delegation | Not typically | Can act on behalf of users |
| UserInfo Response | Application info | Agent info with capabilities |

## Configuring Capabilities

Capabilities define what the agent can do. They map to OAuth scopes but are specifically 
    designed for agent use cases:

```json
{
  "budget_policy": {
    "max_tokens_per_day": 100000,
    "max_api_calls_per_hour": 500,
    "max_cost_per_month_usd": 50,
    "allowed_models": ["gpt-4", "claude-3-sonnet"],
    "require_approval_above_usd": 10
  }
}
```

:::warning[Budget Enforcement]
Budget limits are enforced in real-time. When an agent exceeds its budget,
subsequent requests are rejected until the budget resets or is increased.
:::


## Agent Authentication

### Complete Self-Contained Example

This example demonstrates the full agent authentication lifecycle, from obtaining 
    credentials to making authenticated API calls.

```python
"""
LumoAuth Agent Registry - Complete Authentication Example

This self-contained example demonstrates:
1. Agent registration (via API or dashboard)
2. Client credentials authentication
3. Token refresh and management
4. Checking agent capabilities
5. Making authenticated API calls

Prerequisites:
  Register an agent in LumoAuth dashboard to get:
  - client_id: Unique identifier for your agent
  - client_secret: Secret key for authentication (store securely!)

Environment Variables:
  - LUMOAUTH_URL: Your LumoAuth instance URL
  - LUMOAUTH_TENANT: Your tenant slug
  - AGENT_CLIENT_ID: Agent's OAuth client ID
  - AGENT_CLIENT_SECRET: Agent's OAuth client secret
"""

import os
import time
import requests
from typing import Optional, Dict, Any, List
from functools import wraps

class LumoAuthAgent:
    """
    Complete LumoAuth Agent client with authentication and capability management.
    
    This class handles:
    1. Client credentials authentication
    2. Automatic token refresh
    3. Capability checking
    4. Authenticated API requests
    """
    
    def __init__(
        self,
        base_url: str = None,
        tenant: str = None,
        client_id: str = None,
        client_secret: str = None
    ):
        """
        Initialize the agent client.
        
        In production, always load credentials from environment variables
        or a secure secrets manager - never hardcode them.
        
        Args:
            base_url: LumoAuth server URL
            tenant: Tenant slug (your organization's identifier)
            client_id: Agent's OAuth client ID (from registration)
            client_secret: Agent's OAuth client secret
        """
        # Load configuration from environment or parameters
        self.base_url = base_url or os.environ.get('LUMOAUTH_URL', 'https://app.lumoauth.dev')
        self.tenant = tenant or os.environ.get('LUMOAUTH_TENANT', 'acme-corp')
        self.client_id = client_id or os.environ.get('AGENT_CLIENT_ID')
        self.client_secret = client_secret or os.environ.get('AGENT_CLIENT_SECRET')
        
        if not self.client_id or not self.client_secret:
            raise ValueError(
                "Agent credentials required. Set AGENT_CLIENT_ID and AGENT_CLIENT_SECRET "
                "environment variables or pass them to the constructor."
            )
        
        # Token state
        self.access_token: Optional[str] = None
        self.token_expires_at: float = 0
        self.token_scopes: List[str] = []
        
        # Agent info (populated after authentication)
        self.agent_info: Optional[Dict[str, Any]] = None
    
    # =========================================================================
    # AUTHENTICATION: OAuth 2.0 Client Credentials Flow
    # =========================================================================
    
    def authenticate(self, scopes: List[str] = None) -> bool:
        """
        Authenticate the agent using OAuth 2.0 client credentials flow.
        
        The agent uses its client_id and client_secret to obtain an access token.
        This is the standard way for machine-to-machine authentication.
        
        Args:
            scopes: Optional list of scopes to request (defaults to agent's
                    registered capabilities)
        
        Returns:
            True if authentication succeeded
        
        API Endpoint:
            POST /t/{tenant}/api/v1/oauth/token
            Content-Type: application/x-www-form-urlencoded
        
        Request Body:
            grant_type=client_credentials
            client_id=agt_xxx
            client_secret=secret_xxx
            scope=read:documents tool:search_web (optional)
        """
        print(f"🔐 Authenticating agent...")
        print(f"   LumoAuth URL: {self.base_url}")
        print(f"   Tenant: {self.tenant}")
        print(f"   Client ID: {self.client_id[:12]}...")
        
        # Build request data
        data = {
            'grant_type': 'client_credentials',
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        # Add scopes if specified
        if scopes:
            data['scope'] = ' '.join(scopes)
        
        # Make the authentication request
        response = requests.post(
            f"{self.base_url}/t/{self.tenant}/api/v1/oauth/token",
            data=data
        )
        
        if response.status_code == 200:
            token_data = response.json()
            self.access_token = token_data['access_token']
            self.token_scopes = token_data.get('scope', '').split()
            
            # Calculate token expiration time
            expires_in = token_data.get('expires_in', 3600)
            self.token_expires_at = time.time() + expires_in - 60  # 60s buffer
            
            print(f"✅ Authentication successful!")
            print(f"   Token expires in: {expires_in}s")
            print(f"   Scopes granted: {', '.join(self.token_scopes) or 'default'}")
            
            return True
        
        elif response.status_code == 401:
            print(f"❌ Authentication failed: Invalid credentials")
            print(f"   Check your client_id and client_secret")
            return False
        
        elif response.status_code == 400:
            error_data = response.json()
            print(f"❌ Authentication failed: {error_data.get('error_description', 'Bad request')}")
            return False
        
        else:
            print(f"❌ Authentication failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    
    def ensure_authenticated(self) -> bool:
        """
        Ensure the agent has a valid access token, refreshing if needed.
        
        Call this before making API requests to ensure the token is valid.
        
        Returns:
            True if agent has valid token
        """
        if not self.access_token or time.time() >= self.token_expires_at:
            print("🔄 Token expired or missing, re-authenticating...")
            return self.authenticate(self.token_scopes if self.token_scopes else None)
        return True
    
    def _headers(self) -> Dict[str, str]:
        """Get authorization headers for API requests."""
        return {"Authorization": f"Bearer {self.access_token}"}
    
    # =========================================================================
    # AGENT INFO: Get Agent Identity and Capabilities
    # =========================================================================
    
    def get_agent_info(self) -> Dict[str, Any]:
        """
        Get the agent's identity and capabilities from LumoAuth.
        
        This calls the UserInfo endpoint which, for agents, returns
        agent-specific information including capabilities and budget status.
        
        Returns:
            Agent info dictionary containing:
            - sub: Agent identifier (e.g., "agent:research-bot")
            - name: Human-readable agent name
            - agent_id: Unique agent ID
            - identity_type: Always "agent"
            - capabilities: List of granted capabilities
            - budget_policy: Usage limits and current consumption
        
        API Endpoint:
            GET /t/{tenant}/api/v1/oauth/userinfo
            Authorization: Bearer {access_token}
        """
        self.ensure_authenticated()
        
        print("📋 Fetching agent info...")
        
        response = requests.get(
            f"{self.base_url}/t/{self.tenant}/api/v1/oauth/userinfo",
            headers=self._headers()
        )
        
        if response.status_code == 200:
            self.agent_info = response.json()
            print(f"✅ Agent: {self.agent_info.get('name', 'Unknown')}")
            print(f"   Identity: {self.agent_info.get('sub')}")
            print(f"   Capabilities: {', '.join(self.agent_info.get('capabilities', []))}")
            return self.agent_info
        else:
            print(f"❌ Failed to get agent info: {response.status_code}")

    def has_capability(self, capability: str) -> bool:
        """
        Check if the agent has a specific capability.
        
        Capabilities are the permissions the agent was registered with.
        They define what the agent is allowed to do.
        
        Args:
            capability: The capability to check (e.g., "read:documents")
        
        Returns:
            True if agent has the capability
        """
        if not self.agent_info:
            self.get_agent_info()
        
        capabilities = self.agent_info.get('capabilities', [])
        return capability in capabilities
    
    def get_budget_status(self) -> Dict[str, Any]:
        """
        Get the agent's current budget status.
        
        Budget policies prevent runaway costs and enforce usage limits.
        
        Returns:
            Budget info including:
            - max_tokens_per_day: Daily token limit
            - tokens_used_today: Current consumption
            - max_api_calls_per_hour: Hourly rate limit
            - api_calls_this_hour: Current rate
        """
        if not self.agent_info:
            self.get_agent_info()
        
        return self.agent_info.get('budget_policy', {})
    
    # =========================================================================
    # API CALLS: Making Authenticated Requests
    # =========================================================================
    
    def api_request(
        self,
        method: str,
        endpoint: str,
        data: Dict = None,
        params: Dict = None
    ) -> requests.Response:
        """
        Make an authenticated API request.
        
        Automatically handles authentication and token refresh.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint (can be full URL or path)
            data: Request body for POST/PUT
            params: Query parameters
        
        Returns:
            Response object
        """
        self.ensure_authenticated()
        
        # Handle both full URLs and paths
        if endpoint.startswith('http'):
            url = endpoint
        else:
            url = f"{self.base_url}{endpoint}"
        
        response = requests.request(
            method,
            url,
            headers=self._headers(),
            json=data,
            params=params
        )
        
        return response

    # =========================================================================
    # TOKEN EXCHANGE: For Secured MCP Servers
    # =========================================================================
    
    def get_mcp_token(self, mcp_server_id: str) -> Optional[str]:
        """
        Exchange the agent's token for a token specifically scoped to a secured MCP server
        using RFC 8693 Token Exchange.
        """
        self.ensure_authenticated()
        
        print(f"🔄 Exchanging token for MCP server: {mcp_server_id}...")
        
        data = {
            'grant_type': 'urn:ietf:params:oauth:grant-type:token-exchange',
            'subject_token': self.access_token,
            'subject_token_type': 'urn:ietf:params:oauth:token-type:access_token',
            'audience': mcp_server_id
        }
        
        response = requests.post(
            f"{self.base_url}/t/{self.tenant}/api/v1/oauth/token",
            data=data
        )
        
        if response.status_code == 200:
            token_data = response.json()
            print(f"✅ Token exchange successful for MCP Server")
            return token_data['access_token']
        else:
            print(f"❌ Token exchange failed: {response.text}")
            return None

# =============================================================================
# DECORATOR FOR CAPABILITY CHECKING
# =============================================================================

def require_capability(capability: str):
    """
    Decorator to check agent capabilities before executing a method.
    
    Use this to ensure your agent has the required permissions
    before attempting an operation.
    
    Usage:
        @require_capability('tool:search_web')
        def search(self, query):
            # This only runs if agent has 'tool:search_web' capability
            ...
    """
    def decorator(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            if not self.has_capability(capability):
                raise PermissionError(
                    f"Agent lacks required capability: {capability}. "
                    f"Update agent registration to include this capability."
                )
            return func(self, *args, **kwargs)
        return wrapper
    return decorator

# =============================================================================
# SPECIALIZED AGENT EXAMPLE
# =============================================================================

class ResearchAgent(LumoAuthAgent):
    """
    Example of a specialized agent with capability-gated methods.
    
    This demonstrates how to build an agent that:
    - Checks capabilities before operations
    - Uses the authenticated API client
    - Handles errors gracefully
    """
    
    @require_capability('tool:search_web')
    def search_web(self, query: str) -> Dict[str, Any]:
        """
        Search the web for information.
        
        Requires the 'tool:search_web' capability.
        """
        print(f"🔍 Searching web for: {query}")
        
        response = self.api_request(
            'POST',
            f"/t/{self.tenant}/api/v1/tools/search",
            data={'query': query}
        )
        
        if response.status_code == 200:
            return response.json()
        else:

    @require_capability('read:documents')
    def read_document(self, document_id: str) -> str:
        """
        Read a document from storage.
        
        Requires the 'read:documents' capability.
        """
        print(f"📄 Reading document: {document_id}")
        
        response = self.api_request(
            'GET',
            f"/t/{self.tenant}/api/v1/documents/{document_id}"
        )
        
        if response.status_code == 200:
            return response.json().get('content', '')
        else:
            raise Exception(f"Failed to read document: {response.text}")
    
    @require_capability('write:documents')
    def save_document(self, title: str, content: str) -> str:
        """
        Save a new document.
        
        Requires the 'write:documents' capability.
        """
        print(f"💾 Saving document: {title}")
        
        response = self.api_request(
            'POST',
            f"/t/{self.tenant}/api/v1/documents",
            data={'title': title, 'content': content}
        )
        
        if response.status_code in (200, 201):
            return response.json().get('id')
        else:
            raise Exception(f"Failed to save document: {response.text}")

# =============================================================================
# USAGE EXAMPLE
# =============================================================================

def main():
    """
    Complete example of agent authentication and operation.
    """
    
    # ----- STEP 1: Initialize the Agent -----
    # Credentials come from environment variables in production
    agent = ResearchAgent(
        base_url="https://app.lumoauth.dev",
        tenant="acme-corp",
        client_id="agt_research_bot_12345",
        client_secret="secret_xxxxxxxxxxxxxxxx"
    )
    
    # ----- STEP 2: Authenticate -----
    if not agent.authenticate():
        print("Failed to authenticate. Check credentials.")
        return
    
    # ----- STEP 3: Get Agent Info -----
    info = agent.get_agent_info()
    print(f"\n📊 Agent Status:")
    print(f"   Name: {info.get('name')}")
    print(f"   Capabilities: {info.get('capabilities')}")
    
    budget = agent.get_budget_status()
    if budget:
        print(f"   Tokens used today: {budget.get('tokens_used_today', 0)}/{budget.get('max_tokens_per_day', 'unlimited')}")
    
    # ----- STEP 4: Check Capabilities and Perform Actions -----
    print("\n🔧 Performing operations...")
    
    # This will only work if agent has 'tool:search_web' capability
    if agent.has_capability('tool:search_web'):
        try:
            results = agent.search_web("LumoAuth documentation")
            print(f"   Search results: {len(results.get('items', []))} items")
        except PermissionError as e:
            print(f"   Search failed: {e}")
    else:
        print("   ⚠️ Agent doesn't have 'tool:search_web' capability")
    
    # This will raise PermissionError if capability is missing
    try:
        doc_id = agent.save_document(
            title="Research Summary",
            content="This is a test document."
        )
        print(f"   Document saved: {doc_id}")
    except PermissionError as e:
        print(f"   ⚠️ Cannot save document: {e}")
    except Exception as e:
        print(f"   ❌ Error: {e}")
        
    # ----- STEP 5: Token Exchange for Secured MCP Server -----
    print("\n🔌 Connecting to Secured MCP Server...")
    # This assumes the agent has permission to access this MCP server
    mcp_token = agent.get_mcp_token("urn:mcp:financial-data")
    if mcp_token:
        print(f"   Successfully obtained MCP access token!")
        print(f"   (Pass this token to your MCP client to authenticate)")

if __name__ == "__main__":
    main()
```

### Checking Capabilities at Runtime

```python
def require_capability(capability):
    """Decorator to check agent capabilities before executing"""
    def decorator(func):
        def wrapper(self, *args, **kwargs):
            agent_info = self.get_agent_info()
            capabilities = agent_info.get('capabilities', [])
            
            if capability not in capabilities:
                raise PermissionError(
                    f"Agent lacks required capability: {capability}"
                )
            
            return func(self, *args, **kwargs)
        return wrapper
    return decorator

class ResearchAgent(AgentAuth):
    @require_capability('tool:search_web')
    def search(self, query):
        # Agent has capability, proceed with search
        return perform_web_search(query)
    
    @require_capability('write:documents')
    def save_findings(self, data):
        # Save research findings
        return save_to_database(data)
```

## Viewing Agent in UserInfo

When an agent calls the UserInfo endpoint, it receives agent-specific information:

```json
{
  "sub": "agent:research-bot",
  "name": "Research Assistant Bot",
  "agent_id": "agt_abc123def456",
  "identity_type": "agent",
  "capabilities": [
    "read:documents",
    "tool:search_web",
    "tool:execute_code"
  ],
  "budget_policy": {
    "max_tokens_per_day": 100000,
    "tokens_used_today": 15234,
    "max_api_calls_per_hour": 500,
    "api_calls_this_hour": 47
  },
  "tenant": "acme-corp",
  "workload_identity": null
}
```

## Integrating with LangGraph

LumoAuth agents can be seamlessly integrated into LangGraph architectures. This example shows 
    how to create a LangGraph agent that uses LumoAuth to authenticate, enforce budget 
    policies, and securely exchange tokens for accessing an MCP server as a tool.

```python
import os
from langchain_openai import ChatOpenAI
from langchain_core.tools import tool
from langgraph.prebuilt import create_react_agent
# Assuming LumoAuthAgent is imported from the previous example
# from lumoauth_agent import LumoAuthAgent

# 1. Initialize the LumoAuth Agent
lumo_agent = LumoAuthAgent(
    base_url=os.environ.get('LUMOAUTH_URL', 'https://app.lumoauth.dev'),
    tenant=os.environ.get('LUMOAUTH_TENANT', 'acme-corp'),
    client_id=os.environ.get('AGENT_CLIENT_ID'),
    client_secret=os.environ.get('AGENT_CLIENT_SECRET')
)

# Ensure agent is authenticated before starting
lumo_agent.authenticate()

# 2. Define tools that check LumoAuth capabilities
@tool
def search_company_documents(query: str) -> str:
    """Search internal company documents."""
    # Enforce capability check
    if not lumo_agent.has_capability('read:documents'):
        return "Error: Agent lacks 'read:documents' capability."
    
    # In a real scenario, this would use the lumo_agent.api_request
    return f"Found 3 documents matching '{query}'"

@tool
def query_financial_mcp(metric: str) -> str:
    """Query the secured financial metrics MCP server."""
    # Enforce capability check
    if not lumo_agent.has_capability('mcp:financial'):
        return "Error: Agent lacks 'mcp:financial' capability."
        
    # Get a dedicated token for the MCP server using Token Exchange
    mcp_token = lumo_agent.get_mcp_token("urn:mcp:financial-data")
    if not mcp_token:
        return "Error: Failed to obtain token for Financial MCP server."
        
    # Example: Call the secured MCP server with the exchanged token
    # headers = {"Authorization": f"Bearer {mcp_token}"}
    # response = requests.post("https://mcp.finance.internal/query", headers=headers, json={"metric": metric})
    return f"Retrieved {metric}: $1.2M (Authenticated via MCP Token Exchange)"

# 3. Create the LangGraph React Agent
tools = [search_company_documents, query_financial_mcp]
llm = ChatOpenAI(model="gpt-4", temperature=0)

# Build the Graph
agent_executor = create_react_agent(llm, tools)

# 4. Run the graph
def run_agent_workflow(user_query: str):
    # Check overall budget before execution
    budget = lumo_agent.get_budget_status()
    if budget and budget.get('tokens_used_today', 0) >= budget.get('max_tokens_per_day', float('inf')):
        print("Agent budget exhausted for today.")
        return
        
    print(f"Running query: {user_query}")
    events = agent_executor.stream(
        {"messages": [("user", user_query)]},
        stream_mode="values",
    )
    
    for event in events:
        event["messages"][-1].pretty_print()

if __name__ == "__main__":
    run_agent_workflow("Search documents for Q3 performance, then query the financial MCP for EBITDA.")
```
