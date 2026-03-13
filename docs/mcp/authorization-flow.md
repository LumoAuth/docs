# MCP Authorization Flow

Complete walkthrough of the OAuth 2.1 authorization flow for MCP servers, from initial discovery
    through token issuance and access. This flow implements the MCP Authorization specification
    with LumoAuth acting as the authorization server.

## Complete Flow Diagram

    
```mermaid
sequenceDiagram
participant B as User-Agent (Browser)
participant C as MCP Client
participant M as MCP Server (Resource Server)
participant L as LumoAuth (Authorization Server)

C->>M: MCP request without token
M->>C: HTTP 401 + WWW-Authenticate header
Note over C: Extract resource_metadata URL

C->>L: GET Protected Resource Metadata
L->>C: Return metadata (authorization_servers, scopes)

Note over C: Parse metadata, extract AS URL

C->>L: GET Authorization Server Metadata
L-->>C: AS metadata (endpoints, capabilities)

alt Client ID Metadata Documents
Note over C: Use HTTPS URL as client_id
Note over L: Detect URL-formatted client_id
L->>C: Fetch metadata from client_id URL
C-->>L: JSON metadata document
else Dynamic Client Registration
C->>L: POST /connect/register
L->>C: Client credentials
else Pre-registered Client
Note over C: Use existing client_id
end

Note over C: Generate PKCE parameters (S256)
Note over C: Include resource parameter
C->>B: Open browser with authorization URL
B->>L: Authorization request + code_challenge + resource
Note over L: Authenticate user
L->>B: Redirect to callback with auth code
B->>C: Authorization code callback
C->>L: Token request + code_verifier + resource
L->>C: Access token (+ refresh token)
C->>M: MCP request with Bearer token
M-->>C: MCP response
Note over C,M: MCP communication continues
```

## Step-by-Step Implementation

### Step 1: Trigger the Authorization Challenge

    When an MCP client attempts to connect to a protected MCP server without a token,
    the server returns a `401 Unauthorized` response with a `WWW-Authenticate`
    header containing the Protected Resource Metadata URL:

```bash
# MCP client sends request without authentication
curl -v https://mcp.example.com/mcp

# Server responds:
# HTTP/1.1 401 Unauthorized
# WWW-Authenticate: Bearer resource_metadata="https://app.lumoauth.dev/t/acme-corp/api/v1/.well-known/oauth-protected-resource/mcp/mcp_abc123",
#                         scope="mcp:read mcp:write"
```

### Step 2: Discover the Authorization Server

The MCP client fetches the Protected Resource Metadata to discover which authorization
    server to use:

```bash
curl https://app.lumoauth.dev/t/acme-corp/api/v1/.well-known/oauth-protected-resource/mcp/mcp_abc123
```

```json
{
  "resource": "https://mcp.example.com",
  "authorization_servers": [
    "https://app.lumoauth.dev/t/acme-corp/api/v1/.well-known/oauth-authorization-server"
  ],
  "bearer_methods_supported": ["header"],
  "scopes_supported": ["mcp:read", "mcp:write"]
}
```

Then fetch the Authorization Server Metadata:

```bash
curl https://app.lumoauth.dev/t/acme-corp/api/v1/.well-known/oauth-authorization-server
```

```json
{
  "issuer": "https://app.lumoauth.dev/t/acme-corp/api/v1",
  "authorization_endpoint": "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/authorize",
  "token_endpoint": "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token",
  "introspection_endpoint": "https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/introspect",
  "registration_endpoint": "https://app.lumoauth.dev/t/acme-corp/api/v1/connect/register",
  "code_challenge_methods_supported": ["S256"],
  "grant_types_supported": ["authorization_code", "refresh_token", "client_credentials"],
  "client_id_metadata_document_supported": true
}
```

### Step 3: Client Registration

MCP supports three client registration approaches. Clients SHOULD follow this priority order:

    
| Priority | Method | When to Use |
| --- | --- | --- |
| 1 | **Pre-registered client** | Client has existing credentials for this authorization server |
| 2 | **Client ID Metadata Documents** | AS supports `client_id_metadata_document_supported` &mdash; use HTTPS URL as client_id |
| 3 | **Dynamic Client Registration** | AS provides `registration_endpoint` |

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/connect/register \
  -H "Content-Type: application/json" \
  -d '{
    "client_name": "My MCP Client",
    "redirect_uris": ["http://127.0.0.1:3000/callback"],
    "grant_types": ["authorization_code", "refresh_token"],
    "response_types": ["code"],
    "token_endpoint_auth_method": "none"
  }'
```

    
        
    
    
        
Public Client Authentication

        
Setting `token_endpoint_auth_method: "none"` creates a public client that doesn't require a client secret. However, the `client_id` returned in the registration response **must still be sent** in all token requests. Public clients use PKCE for security instead of a shared secret.

    

### Step 4: Authorization Request

The MCP client initiates the OAuth 2.1 authorization code flow with PKCE and resource parameter:

```bash
# Generate PKCE parameters
CODE_VERIFIER=$(openssl rand -base64 32 | tr -d '=/+' | head -c 43)
CODE_CHALLENGE=$(echo -n "$CODE_VERIFIER" | openssl dgst -sha256 -binary | openssl base64 -A | tr '+/' '-_' | tr -d '=')

# Build authorization URL
AUTH_URL="https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/authorize?\
response_type=code&\
client_id=CLIENT_ID&\
redirect_uri=http://127.0.0.1:3000/callback&\
scope=mcp:read mcp:write&\
resource=https://mcp.example.com&\
code_challenge=$CODE_CHALLENGE&\
code_challenge_method=S256&\
state=RANDOM_STATE"

# Open in browser for user authentication
echo "Open in browser: $AUTH_URL"
```

:::warning[Required Parameters]
The `resource` parameter must match a registered MCP server URI in your tenant.
Use the exact URI configured during server registration.
:::


```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=AUTHORIZATION_CODE" \
  -d "redirect_uri=http://127.0.0.1:3000/callback" \
  -d "client_id=CLIENT_ID" \
  -d "code_verifier=$CODE_VERIFIER" \
  -d "resource=https://mcp.example.com"
```

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "dGhpcyBpcyBhIHJlZnJlc2ggdG9rZW4...",
  "scope": "mcp:read mcp:write"
}
```

### Step 6: Access the MCP Server

Include the access token in the `Authorization` header for all MCP requests:

```bash
curl -X POST https://mcp.example.com/mcp \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list"
  }'
```

    Token in Every Request
    
Per the MCP spec, authorization MUST be included in **every HTTP request** from client to server, even if they are part of the same logical session. Tokens MUST NOT be included in the URI query string.

## Token Validation

Your MCP server MUST validate access tokens before processing requests. LumoAuth supports two validation methods:

### Option A: Token Introspection

```bash
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/introspect \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -d "token=eyJhbGciOiJSUzI1NiIs..."
```

```json
{
  "active": true,
  "scope": "mcp:read mcp:write",
  "client_id": "client_abc123",
  "token_type": "Bearer",
  "exp": 1739190000,
  "aud": "https://mcp.example.com",
  "sub": "user-uuid"
}
```

### Option B: JWT Verification

For JWT access tokens (default in LumoAuth), validate locally using the tenant's public keys:

1. Fetch the JWKS from LumoAuth's `jwks_uri`
2. Verify the JWT signature
3. Check `exp` (expiration), `iss` (issuer), and `aud` (audience)
4. Verify `aud` matches your server's Resource URI

    Audience Validation is Critical
    
MCP servers MUST validate that the `aud` (audience) claim matches their Resource URI. Without this check, tokens issued for other services could be replayed against your MCP server. This prevents the [confused deputy problem](https://modelcontextprotocol.io/specification/draft/basic/security_best_practices#token-passthrough).

## Error Handling

    
| Status | When | Header |
| --- | --- | --- |
| `401 Unauthorized` | No token, expired token, or invalid token | `WWW-Authenticate: Bearer resource_metadata="..."` |
| `403 Forbidden` | Token valid but insufficient scopes | `WWW-Authenticate: Bearer error="insufficient_scope", scope="...", resource_metadata="..."` |

### Common Token Request Errors

    
| Error | Description | Solution |
| --- | --- | --- |
| `invalid_request` | Missing required parameter: client_id | Always include `client_id` in token requests, even for public clients with `token_endpoint_auth_method: "none"` |
| `invalid_grant` | Invalid or expired authorization code | Authorization codes are single-use and expire after 5 minutes. Ensure you exchange them immediately. |
| `invalid_grant` | PKCE validation failed | Verify your `code_verifier` matches the `code_challenge` sent in the authorization request |
| `invalid_client` | Client authentication failed | For confidential clients, verify your client_secret is correct. For public clients, ensure client_id is included. |
| `invalid_target` | Invalid or unauthorized resource | The `resource` parameter must match a registered MCP server Resource URI |

## Security Considerations

- **PKCE Required**: MCP clients MUST use PKCE with `S256`. LumoAuth rejects authorization requests without a valid code challenge.
- **Resource Binding**: Tokens are bound to the MCP server's Resource URI via the `resource` parameter (RFC 8707) and `aud` claim.
- **No Token Passthrough**: MCP servers MUST NOT forward client tokens to upstream APIs. Each service-to-service call requires its own token.
- **Short-lived Tokens**: LumoAuth issues short-lived access tokens (configurable per MCP server). Use refresh tokens for long-lived sessions.
- **HTTPS Only**: All authorization server endpoints use HTTPS. Resource URIs should use HTTPS in production.
