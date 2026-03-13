# MCP Server Registration

Register your MCP servers in LumoAuth to enable OAuth 2.0 authorization. Each registered server
    becomes a protected resource with its own discovery endpoints, scopes, and token audience binding.

## Registration via Tenant Portal

The simplest way to register an MCP server is through the Tenant Portal UI:

1. Navigate to **Developer &gt; MCP Servers** in the Tenant Portal
2. Click **Register MCP Server**
3. Fill in the required fields:
        
- **Server Name** &mdash; A human-readable name
- **Resource URI** &mdash; The canonical URI of your MCP server (per RFC 8707)
4. Configure optional settings (transport type, scopes, token lifetime)
5. Click **Register**

## Server Configuration

### Required Fields

    
| Field | Description | Example |
| --- | --- | --- |
| `name` | Human-readable server name | `Code Search MCP Server` |
| `resource_uri` | Canonical URI per RFC 8707. Used as the `resource` parameter in OAuth requests and for token audience binding. | `https://mcp.example.com` |

### Optional Fields

    
| Field | Default | Description |
| --- | --- | --- |
| `endpoint_url` | *null* | The URL where the MCP server accepts connections |
| `transport` | `http_streamable` | Transport type: `http_streamable`, `http_sse`, or `stdio` |
| `auth_mode` | `oauth` | `oauth` for protected servers, `none` for public |
| `scopes_supported` | `[]` | Space-separated OAuth scopes this server supports |
| `token_lifetime` | `3600` | Access token lifetime in seconds (60&ndash;86400) |
| `allowed_client_ids` | `[]` | Restrict access to specific OAuth client IDs. Empty = all tenant clients. |

## Resource URI Requirements

The Resource URI is the canonical identifier of your MCP server per
    [RFC 8707 (Resource Indicators)](https://www.rfc-editor.org/rfc/rfc8707.html).
    It is used as:

- The `resource` parameter in authorization and token requests
- The audience (`aud`) claim in JWT access tokens
- The `resource` field in Protected Resource Metadata (RFC 9728)

:::tip[Valid Resource URIs]
Resource URIs must be valid HTTPS URLs that uniquely identify your MCP server.
Example: `https://api.example.com/mcp/weather-service`
:::


Returns all active MCP servers for the tenant. Requires Bearer token authentication.

```bash
curl -X GET https://app.lumoauth.dev/t/acme-corp/api/v1/mcp/servers \
  -H "Authorization: Bearer "
```

```json
{
  "servers": [
    {
      "id": 1,
      "server_id": "mcp_a1b2c3d4e5f6a1b2c3d4e5f6",
      "name": "Code Search MCP Server",
      "description": "Provides code search and analysis tools",
      "resource_uri": "https://mcp.example.com",
      "endpoint_url": "https://mcp.example.com/mcp",
      "transport": "http_streamable",
      "auth_mode": "oauth",
      "status": "active",
      "scopes_supported": ["mcp:read", "mcp:write"],
      "require_pkce": true,
      "require_resource_param": true,
      "token_lifetime": 3600,
      "created_at": "2026-02-10T12:00:00+00:00"
    }
  ]
}
```

### Get MCP Server Details

    
        **GET** 
        `/t/\{tenantSlug\}/api/v1/mcp/servers/\{serverId\}`
    

Returns detailed information about a specific MCP server, including discovery URLs and example headers.

```json
{
  "id": 1,
  "server_id": "mcp_a1b2c3d4e5f6a1b2c3d4e5f6",
  "name": "Code Search MCP Server",
  "resource_uri": "https://mcp.example.com",
  "transport": "http_streamable",
  "auth_mode": "oauth",
  "status": "active",
  "scopes_supported": ["mcp:read", "mcp:write"],
  "discovery": {
    "authorization_server_metadata": "https://app.lumoauth.dev/t/acme-corp/api/v1/.well-known/oauth-authorization-server",
    "protected_resource_metadata": "https://app.lumoauth.dev/t/acme-corp/api/v1/.well-known/oauth-protected-resource/mcp/mcp_a1b2c3d4",
    "www_authenticate_example": "Bearer resource_metadata=\"https://...\", scope=\"mcp:read mcp:write\""
  }
}
```

## Security Settings

### PKCE Requirement

Per the MCP Authorization specification, MCP clients **MUST** implement PKCE with the
    `S256` code challenge method. LumoAuth enforces this for all OAuth-protected MCP servers
    by default.

### Resource Parameter (RFC 8707)

MCP clients **MUST** include the `resource` parameter in both authorization
    and token requests, set to the server's Resource URI. This binds the access token to the specific
    MCP server, preventing token misuse across different services.

### Client Restrictions

By default, all OAuth clients within a tenant can request tokens for any MCP server. You can
    restrict access by setting **Allowed Client IDs** &mdash; only listed clients will be
    permitted to obtain tokens for the server.
