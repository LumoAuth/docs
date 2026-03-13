# Chain of Agency

When agents act on behalf of users or delegate to other agents, LumoAuth creates a 
    verifiable chain of identity. This enables complete audit trails and fine-grained access control.

## Understanding Delegation

Delegation answers the question: "Who is really behind this action?"

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:token-exchange" \
  -d "subject_token=USER_ACCESS_TOKEN" \
  -d "subject_token_type=urn:ietf:params:oauth:token-type:access_token" \
  -d "actor_token=AGENT_ACCESS_TOKEN" \
  -d "actor_token_type=urn:ietf:params:oauth:token-type:access_token"
```

### Response

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "issued_token_type": "urn:ietf:params:oauth:token-type:access_token"
}
```

## The Actor Claim

The resulting JWT contains an `act` (actor) claim that captures the delegation chain:

```json
{
  "iss": "https://app.lumoauth.dev",
  "sub": "user:alice",
  "act": {
    "sub": "agent:research-bot"
  },
  "scope": "read:documents write:reports",
  "exp": 1704067200,
  "iat": 1704063600
}
```

This token says: **"research-bot is acting as alice"**

## Nested Delegation

Agents can delegate to other agents, creating chains of any depth:

```json
{
  "sub": "user:alice",
  "act": {
    "sub": "agent:orchestrator",
    "act": {
      "sub": "agent:search-tool",
      "act": {
        "sub": "agent:web-scraper"
      }
    }
  }
}
```

Reading bottom-up: *"web-scraper, called by search-tool, called by orchestrator, 
    acting for alice"*

:::warning[Delegation Limits]
Token exchange delegation chains have a maximum depth of 3 levels to prevent
unbounded delegation. Each level reduces the available scopes.
:::


## Implementation Example

### Complete Self-Contained Example

This example demonstrates the full delegation flow: agent authentication, 
    obtaining user consent, token exchange, and performing delegated actions.

```python
"""
LumoAuth Chain of Agency - Complete Delegation Example

This self-contained example demonstrates:
1. Agent authentication using client credentials
2. Obtaining user consent for delegation
3. RFC 8693 Token Exchange for delegated tokens
4. Performing actions on behalf of users
5. Nested agent-to-agent delegation
6. Complete audit trail creation

Key Concepts:
  - Subject Token: The user's token (who the agent acts FOR)
  - Actor Token: The agent's token (who is doing the acting)
  - Delegated Token: Result that represents the delegation chain

Prerequisites:
  Register an agent in LumoAuth dashboard with:
  - client_id: Agent's OAuth client ID
  - client_secret: Agent's OAuth client secret
  - Capability: 'delegate:on_behalf' (required for delegation)

Environment Variables:
  - LUMOAUTH_URL: Your LumoAuth instance URL
  - LUMOAUTH_TENANT: Your tenant slug
  - AGENT_CLIENT_ID: Agent's OAuth client ID
  - AGENT_CLIENT_SECRET: Agent's OAuth client secret
"""

import os
import time
import jwt
import requests
from typing import Optional, Dict, Any, List
from urllib.parse import urlencode

class LumoAuthDelegatingAgent:
    """
    Complete LumoAuth agent with RFC 8693 Token Exchange for delegation.
    
    This class handles:
    1. Agent authentication (client credentials)
    2. User consent flow (OAuth authorization code)
    3. Token exchange for delegation
    4. Delegated API calls with full audit trails
    5. Nested delegation for multi-agent workflows
    """
    
    # RFC 8693 Token Type URIs
    ACCESS_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:access_token"
    REFRESH_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:refresh_token"
    ID_TOKEN_TYPE = "urn:ietf:params:oauth:token-type:id_token"
    TOKEN_EXCHANGE_GRANT = "urn:ietf:params:oauth:grant-type:token-exchange"
    
    def __init__(
        self,
        base_url: str = None,
        tenant: str = None,
        client_id: str = None,
        client_secret: str = None,
        redirect_uri: str = None
    ):
        """
        Initialize the delegating agent.
        
        Args:
            base_url: LumoAuth server URL
            tenant: Tenant slug (your organization's identifier)
            client_id: Agent's OAuth client ID
            client_secret: Agent's OAuth client secret
            redirect_uri: Callback URL for user consent flow
        """
        # Load configuration from environment or parameters
        self.base_url = base_url or os.environ.get('LUMOAUTH_URL', 'https://app.lumoauth.dev')
        self.tenant = tenant or os.environ.get('LUMOAUTH_TENANT', 'acme-corp')
        self.client_id = client_id or os.environ.get('AGENT_CLIENT_ID')
        self.client_secret = client_secret or os.environ.get('AGENT_CLIENT_SECRET')
        self.redirect_uri = redirect_uri or os.environ.get('AGENT_REDIRECT_URI', 'https://agent.example.com/callback')
        
        if not self.client_id or not self.client_secret:
            raise ValueError(
                "Agent credentials required. Set AGENT_CLIENT_ID and AGENT_CLIENT_SECRET."
            )
        
        # Token state
        self.agent_token: Optional[str] = None
        self.agent_token_expires: float = 0
        
        # User consent tokens (keyed by user_id or session)
        self.user_tokens: Dict[str, Dict[str, Any]] = {}
        
        # Delegated tokens cache
        self.delegated_tokens: Dict[str, str] = {}
    
    # =========================================================================
    # STEP 1: AGENT AUTHENTICATION
    # =========================================================================
    
    def authenticate(self) -> bool:
        """
        Authenticate the agent using OAuth 2.0 client credentials flow.
        
        The agent must authenticate itself before it can request delegation.
        This establishes the agent's identity in the system.
        
        Returns:
            True if authentication succeeded
        
        API Endpoint:
            POST /t/{tenant}/api/v1/oauth/token
            Content-Type: application/x-www-form-urlencoded
        
        Request Body:
            grant_type=client_credentials
            client_id=agt_xxx
            client_secret=secret_xxx
        """
        print(f"🔐 Authenticating agent...")
        print(f"   LumoAuth URL: {self.base_url}")
        print(f"   Tenant: {self.tenant}")
        print(f"   Client ID: {self.client_id[:12]}...")
        
        response = requests.post(
            f"{self.base_url}/t/{self.tenant}/api/v1/oauth/token",
            data={
                'grant_type': 'client_credentials',
                'client_id': self.client_id,
                'client_secret': self.client_secret,
                # Request delegation capability
                'scope': 'delegate:on_behalf'
            }
        )
        
        if response.status_code == 200:
            token_data = response.json()
            self.agent_token = token_data['access_token']
            expires_in = token_data.get('expires_in', 3600)
            self.agent_token_expires = time.time() + expires_in - 60
            
            print(f"✅ Agent authenticated successfully")
            print(f"   Token expires in: {expires_in}s")
            print(f"   Scopes: {token_data.get('scope', 'default')}")
            return True
        else:
            print(f"❌ Agent authentication failed: {response.text}")
            return False
    
    def ensure_authenticated(self) -> bool:
        """Ensure agent has a valid token, refreshing if needed."""
        if not self.agent_token or time.time() >= self.agent_token_expires:
            return self.authenticate()
        return True
    
    # =========================================================================
    # STEP 2: USER CONSENT - Get Permission to Act on User's Behalf
    # =========================================================================
    
    def get_consent_url(
        self,
        user_session_id: str,
        scopes: List[str] = None,
        state: str = None
    ) -> str:
        """
        Generate URL where user can grant the agent permission to act for them.
        
        This initiates the OAuth authorization code flow. The user will be
        redirected to LumoAuth, authenticate, and grant consent.
        
        Args:
            user_session_id: Identifier for this user's session (to track consent)
            scopes: What the agent wants to do on behalf of the user
            state: CSRF protection state parameter
        
        Returns:
            URL to redirect the user to for consent
        
        Example scopes:
            - read:documents - Read user's documents
            - write:documents - Create/modify documents
            - read:calendar - Access calendar
        """
        scopes = scopes or ['read:documents', 'write:documents']
        state = state or f"session:{user_session_id}"
        
        # Build authorization URL with delegation indicator
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': ' '.join(scopes),
            'state': state,
            # Indicate this is for agent delegation
            'prompt': 'consent',
            'access_type': 'offline',  # Get refresh token for long-term delegation
        }
        
        consent_url = f"{self.base_url}/t/{self.tenant}/api/v1/oauth/authorize?{urlencode(params)}"
        
        print(f"📋 User consent URL generated")
        print(f"   Scopes requested: {', '.join(scopes)}")
        print(f"   Redirect after consent: {self.redirect_uri}")
        
        return consent_url
    
    def handle_consent_callback(
        self,
        user_session_id: str,
        authorization_code: str
    ) -> bool:
        """
        Handle the callback after user grants consent.
        
        Exchange the authorization code for the user's tokens.
        These tokens represent the user's consent for delegation.
        
        Args:
            user_session_id: Session identifier from consent request
            authorization_code: Code from callback URL
        
        Returns:
            True if tokens obtained successfully
        
        API Endpoint:
            POST /t/{tenant}/api/v1/oauth/token
        
        Request Body:
            grant_type=authorization_code
            code=AUTH_CODE
            redirect_uri=...
            client_id=...
            client_secret=...
        """
        print(f"🔄 Exchanging authorization code for user tokens...")
        
        response = requests.post(
            f"{self.base_url}/t/{self.tenant}/api/v1/oauth/token",
            data={
                'grant_type': 'authorization_code',
                'code': authorization_code,
                'redirect_uri': self.redirect_uri,
                'client_id': self.client_id,
                'client_secret': self.client_secret
            }
        )
        
        if response.status_code == 200:
            token_data = response.json()
            
            # Store user's tokens for later delegation
            self.user_tokens[user_session_id] = {
                'access_token': token_data['access_token'],
                'refresh_token': token_data.get('refresh_token'),
                'expires_at': time.time() + token_data.get('expires_in', 3600),
                'scopes': token_data.get('scope', '').split()
            }
            
            print(f"✅ User consent obtained!")
            print(f"   User scopes: {token_data.get('scope')}")
            print(f"   Refresh token: {'Yes' if token_data.get('refresh_token') else 'No'}")
            return True
        else:
            print(f"❌ Failed to exchange code: {response.text}")
            return False
    
    # =========================================================================
    # STEP 3: TOKEN EXCHANGE - RFC 8693
    # =========================================================================
    
    def get_delegated_token(
        self,
        user_session_id: str,
        requested_scopes: List[str] = None
    ) -> Optional[str]:
        """
        Exchange tokens to get a delegated token for acting on user's behalf.
        
        This is the core of RFC 8693 Token Exchange:
        - Subject Token: User's token (who we're acting FOR)
        - Actor Token: Agent's token (who is doing the acting)
        - Result: Delegated token with 'act' claim showing the chain
        
        Args:
            user_session_id: Session ID of the consenting user
            requested_scopes: Optional scope reduction
        
        Returns:
            Delegated access token, or None if exchange failed
        
        API Endpoint:
            POST /t/{tenant}/api/v1/oauth/token
        
        Request Body:
            grant_type=urn:ietf:params:oauth:grant-type:token-exchange
            subject_token=USER_TOKEN
            subject_token_type=urn:ietf:params:oauth:token-type:access_token
            actor_token=AGENT_TOKEN
            actor_token_type=urn:ietf:params:oauth:token-type:access_token
            scope=requested_scopes (optional, must be subset)
        """
        # Ensure we have agent and user tokens
        self.ensure_authenticated()
        
        if user_session_id not in self.user_tokens:
            print(f"❌ No consent tokens for session: {user_session_id}")
            print(f"   User must complete consent flow first")
            return None
        
        user_token_data = self.user_tokens[user_session_id]
        
        # Check if user token needs refresh
        if time.time() >= user_token_data['expires_at']:
            if not self._refresh_user_token(user_session_id):
                print(f"❌ User token expired and refresh failed")
                return None
            user_token_data = self.user_tokens[user_session_id]
        
        print(f"🔄 Performing RFC 8693 Token Exchange...")
        print(f"   Subject (user): token present")
        print(f"   Actor (agent): {self.client_id[:12]}...")
        
        # Build token exchange request
        data = {
            'grant_type': self.TOKEN_EXCHANGE_GRANT,
            # Subject = the user (who we're acting for)
            'subject_token': user_token_data['access_token'],
            'subject_token_type': self.ACCESS_TOKEN_TYPE,
            # Actor = the agent (who is doing the acting)
            'actor_token': self.agent_token,
            'actor_token_type': self.ACCESS_TOKEN_TYPE,
        }
        
        # Optional scope reduction (cannot exceed user's or agent's scopes)
        if requested_scopes:
            data['scope'] = ' '.join(requested_scopes)
        
        response = requests.post(
            f"{self.base_url}/t/{self.tenant}/api/v1/oauth/token",
            data=data
        )
        
        if response.status_code == 200:
            token_data = response.json()
            delegated_token = token_data['access_token']
            
            # Cache the delegated token
            self.delegated_tokens[user_session_id] = delegated_token
            
            print(f"✅ Token Exchange successful!")
            print(f"   Delegated token obtained")
            print(f"   Expires in: {token_data.get('expires_in')}s")
            
            # Decode and show the delegation chain
            self._show_token_claims(delegated_token)
            
            return delegated_token
        
        elif response.status_code == 400:
            error = response.json()
            error_code = error.get('error')
            
            if error_code == 'invalid_grant':
                print(f"❌ Token exchange failed: Invalid or expired tokens")
            elif error_code == 'insufficient_scope':
                print(f"❌ Token exchange failed: Requested scopes exceed allowed")
            else:
                print(f"❌ Token exchange failed: {error.get('error_description')}")
            return None
        
        elif response.status_code == 403:
            print(f"❌ Token exchange forbidden: Agent lacks 'delegate:on_behalf' capability")
            return None
        
        else:
            print(f"❌ Token exchange failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return None
    
    def _show_token_claims(self, token: str):
        """Decode and display the delegation chain from the token."""
        try:
            # Decode without verification (just for display)
            claims = jwt.decode(token, options={"verify_signature": False})
            
            print(f"\n📜 Token Claims:")
            print(f"   Subject (sub): {claims.get('sub')}")
            
            # Show the actor chain
            act = claims.get('act')
            if act:
                print(f"   Actor (act):")
                depth = 1
                while act:
                    indent = "      " + "  " * depth
                    print(f"{indent}↳ {act.get('sub')}")
                    act = act.get('act')
                    depth += 1
            
            print(f"   Scopes: {claims.get('scope')}")
            print(f"   Expires: {time.ctime(claims.get('exp', 0))}")
        except:
            pass  # Token display is optional
    
    def _refresh_user_token(self, user_session_id: str) -> bool:
        """Refresh a user's access token using their refresh token."""
        user_data = self.user_tokens.get(user_session_id)
        if not user_data or not user_data.get('refresh_token'):
            return False
        
        print(f"🔄 Refreshing user token...")
        
        response = requests.post(
            f"{self.base_url}/t/{self.tenant}/api/v1/oauth/token",
            data={
                'grant_type': 'refresh_token',
                'refresh_token': user_data['refresh_token'],
                'client_id': self.client_id,
                'client_secret': self.client_secret
            }
        )
        
        if response.status_code == 200:
            token_data = response.json()
            self.user_tokens[user_session_id] = {
                'access_token': token_data['access_token'],
                'refresh_token': token_data.get('refresh_token', user_data['refresh_token']),
                'expires_at': time.time() + token_data.get('expires_in', 3600),
                'scopes': token_data.get('scope', '').split()
            }
            print(f"✅ User token refreshed")
            return True
        
        print(f"❌ Token refresh failed: {response.text}")
        return False
    
    # =========================================================================
    # STEP 4: PERFORM DELEGATED ACTIONS
    # =========================================================================
    
    def act_on_behalf(
        self,
        user_session_id: str,
        method: str,
        endpoint: str,
        data: Dict = None
    ) -> requests.Response:
        """
        Perform an API action on behalf of the user.
        
        Uses the delegated token which contains the full delegation chain.
        All actions are logged with the complete actor chain for audit.
        
        Args:
            user_session_id: Session of the user we're acting for
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint path
            data: Request body for POST/PUT
        
        Returns:
            API response
        
        Audit Log Entry Will Show:
            {
                "principal": {
                    "subject": "user:alice",
                    "actor_chain": ["agent:research-bot"]
                },
                "action": "document.create",
                ...
            }
        """
        # Get or create delegated token
        delegated_token = self.delegated_tokens.get(user_session_id)
        if not delegated_token:
            delegated_token = self.get_delegated_token(user_session_id)
        
        if not delegated_token:
            raise Exception("Failed to obtain delegated token")
        
        # Make the API request with the delegated token
        url = f"{self.base_url}{endpoint}"
        headers = {"Authorization": f"Bearer {delegated_token}"}
        
        response = requests.request(method, url, headers=headers, json=data)
        
        return response
    
    # =========================================================================
    # STEP 5: NESTED DELEGATION (Agent-to-Agent)
    # =========================================================================
    
    def delegate_to_sub_agent(
        self,
        user_session_id: str,
        sub_agent_token: str,
        allowed_scopes: List[str] = None
    ) -> Optional[str]:
        """
        Delegate the user's authorization to another agent.
        
        Creates a nested delegation chain:
        User → This Agent → Sub-Agent
        
        The resulting token will have nested 'act' claims showing
        the complete chain of delegation.
        
        Args:
            user_session_id: Original user session
            sub_agent_token: The sub-agent's authentication token
            allowed_scopes: Scopes to grant (must be subset of current)
        
        Returns:
            Delegated token for the sub-agent
        
        Result Token Claims:
            {
                "sub": "user:alice",
                "act": {
                    "sub": "agent:orchestrator",
                    "act": {
                        "sub": "agent:specialist-tool"
                    }
                }
            }
        """
        # First, get our delegated token (this agent acting for user)
        our_delegated_token = self.delegated_tokens.get(user_session_id)
        if not our_delegated_token:
            our_delegated_token = self.get_delegated_token(user_session_id)
        
        if not our_delegated_token:
            print(f"❌ Cannot delegate: No token for user session")
            return None
        
        print(f"🔗 Creating nested delegation to sub-agent...")
        
        # Exchange again: our delegated token → sub-agent's actor token
        data = {
            'grant_type': self.TOKEN_EXCHANGE_GRANT,
            # Subject = our delegated token (user + us as actor)
            'subject_token': our_delegated_token,
            'subject_token_type': self.ACCESS_TOKEN_TYPE,
            # New actor = the sub-agent
            'actor_token': sub_agent_token,
            'actor_token_type': self.ACCESS_TOKEN_TYPE,
        }
        
        if allowed_scopes:
            data['scope'] = ' '.join(allowed_scopes)
        
        response = requests.post(
            f"{self.base_url}/t/{self.tenant}/api/v1/oauth/token",
            data=data
        )
        
        if response.status_code == 200:
            nested_token = response.json()['access_token']
            print(f"✅ Nested delegation created!")
            self._show_token_claims(nested_token)
            return nested_token
        
        elif response.status_code == 403:
            error = response.json()
            if error.get('error') == 'delegation_depth_exceeded':
                print(f"❌ Delegation chain too deep (limit: {error.get('max_depth', 3)})")
            else:
                print(f"❌ Nested delegation forbidden: {error.get('error_description')}")
            return None
        
        else:
            print(f"❌ Nested delegation failed: {response.text}")
            return None
    
    def revoke_delegation(self, user_session_id: str) -> bool:
        """
        Revoke the delegation for a user session.
        
        Cleans up tokens and notifies LumoAuth to invalidate them.
        """
        # Get the refresh token to revoke
        user_data = self.user_tokens.get(user_session_id)
        if not user_data:
            return True  # Nothing to revoke
        
        print(f"🗑️ Revoking delegation for session: {user_session_id[:16]}...")
        
        # Revoke the refresh token (invalidates all related tokens)
        if user_data.get('refresh_token'):
            response = requests.post(
                f"{self.base_url}/t/{self.tenant}/api/v1/oauth/revoke",
                data={
                    'token': user_data['refresh_token'],
                    'token_type_hint': 'refresh_token',
                    'client_id': self.client_id,
                    'client_secret': self.client_secret
                }
            )
            
            if response.status_code == 200:
                print(f"✅ Delegation revoked at LumoAuth")
            else:
                print(f"⚠️ Revocation may have failed: {response.status_code}")
        
        # Clean up local state
        self.user_tokens.pop(user_session_id, None)
        self.delegated_tokens.pop(user_session_id, None)
        
        return True

# =============================================================================
# USAGE EXAMPLE - Complete Delegation Flow
# =============================================================================

def main():
    """
    Complete example demonstrating the delegation workflow.
    """
    
    # ----- INITIALIZE AGENT -----
    agent = LumoAuthDelegatingAgent(
        base_url="https://app.lumoauth.dev",
        tenant="acme-corp",
        client_id="agt_orchestrator_12345",
        client_secret="secret_xxxxxxxxxxxxxxxx",
        redirect_uri="https://agent.example.com/oauth/callback"
    )
    
    # ----- STEP 1: AUTHENTICATE THE AGENT -----
    print("=" * 60)
    print("STEP 1: Agent Authentication")
    print("=" * 60)
    
    if not agent.authenticate():
        print("Failed to authenticate agent. Check credentials.")
        return
    
    # ----- STEP 2: GET USER CONSENT -----
    print("\n" + "=" * 60)
    print("STEP 2: User Consent Flow")
    print("=" * 60)
    
    user_session = "session_abc123"
    
    # Generate consent URL (in real app, redirect user here)
    consent_url = agent.get_consent_url(
        user_session_id=user_session,
        scopes=['read:documents', 'write:documents', 'read:calendar']
    )
    print(f"\n📱 Redirect user to:\n   {consent_url}")
    
    # Simulate callback after user grants consent
    # In real app, this comes from the OAuth callback
    print("\n   [Simulating user consent...]")
    auth_code = "simulated_auth_code_from_callback"
    agent.handle_consent_callback(user_session, auth_code)
    
    # ----- STEP 3: TOKEN EXCHANGE -----
    print("\n" + "=" * 60)
    print("STEP 3: RFC 8693 Token Exchange")
    print("=" * 60)
    
    delegated_token = agent.get_delegated_token(
        user_session_id=user_session,
        # Optional: request fewer scopes than granted
        requested_scopes=['read:documents']
    )
    
    if not delegated_token:
        print("Failed to get delegated token.")
        return
    
    # ----- STEP 4: PERFORM ACTIONS ON BEHALF OF USER -----
    print("\n" + "=" * 60)
    print("STEP 4: Delegated Actions")
    print("=" * 60)
    
    # These actions are logged with full delegation chain
    response = agent.act_on_behalf(
        user_session,
        method='GET',
        endpoint=f'/t/{agent.tenant}/api/v1/documents'
    )
    print(f"📄 Listed documents: {response.status_code}")
    
    response = agent.act_on_behalf(
        user_session,
        method='POST',
        endpoint=f'/t/{agent.tenant}/api/v1/documents',
        data={'title': 'Meeting Notes', 'content': 'Notes from today...'}
    )
    print(f"📝 Created document: {response.status_code}")
    
    # ----- STEP 5: NESTED DELEGATION (Optional) -----
    print("\n" + "=" * 60)
    print("STEP 5: Nested Delegation (Agent → Sub-Agent)")
    print("=" * 60)
    
    # Simulate a sub-agent's token
    sub_agent_token = "sub_agent_simulated_token"
    
    nested_token = agent.delegate_to_sub_agent(
        user_session_id=user_session,
        sub_agent_token=sub_agent_token,
        allowed_scopes=['read:documents']  # Reduce scope for sub-agent
    )
    
    if nested_token:
        print(f"✅ Sub-agent can now act as: user → orchestrator → specialist")
    
    # ----- CLEANUP -----
    print("\n" + "=" * 60)
    print("Cleanup: Revoking Delegation")
    print("=" * 60)
    
    agent.revoke_delegation(user_session)
    
    print("\n🎉 Delegation workflow complete!")

if __name__ == "__main__":
    main()
```

## Audit Trail

All actions performed with delegated tokens are logged with the complete chain:

```json
{
  "timestamp": "2024-01-01T12:34:56Z",
  "action": "document.create",
  "resource": "document:q4-analysis",
  "principal": {
    "subject": "user:alice",
    "actor_chain": [
      "agent:research-bot"
    ]
  },
  "result": "allowed",
  "ip_address": "10.0.1.50",
  "user_agent": "LumoAuth-Agent/1.0"
}
```

## Access Control for Delegation

Not all agents can delegate for all users. LumoAuth enforces:

- **Capability Check:** Agent must have `delegate:on_behalf` capability
- **User Consent:** User must have granted the agent permission to act for them
- **Scope Reduction:** Delegated token cannot have more scopes than either the user or agent
- **Time Limits:** Delegated tokens typically have shorter lifetimes

:::tip[User Consent Flow]
When an agent needs elevated permissions, the user is redirected to a consent screen
showing exactly what the agent is requesting. The agent receives a delegated token only after
explicit user approval.
:::

