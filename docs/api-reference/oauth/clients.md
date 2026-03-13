# OAuth Clients

                
OAuth clients represent applications that can authenticate users via LumoAuth.

            
        

        
OAuth clients are applications registered with LumoAuth that can request access tokens on behalf of users
            (authorization code flow) or for themselves (client credentials flow). Each client has a unique client ID
            and optionally a client secret for confidential clients.

        > [!NOTE]
> **Client Types**

    
        
            The OAuth Client Object
            
                
                    json
                    
                
                
```
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Mobile App",
  "description": "iOS and Android mobile application",
  "isConfidential": false,
  "redirectUris": [
    "myapp://callback",
    "https://myapp.com/oauth/callback"
  ],
  "allowedScopes": ["openid", "profile", "email"],
  "grantTypes": ["authorization_code", "refresh_token"],
  "isActive": true,
  "accessTokenLifetime": 3600,
  "refreshTokenLifetime": 2592000,
  "createdAt": "2024-01-15T12:00:00Z"
}
```

            
        
    

    
    

    
        ## The OAuth Client Object

        
        
            Attributes
            
                
                    id
                    
                        string (UUID)
                        The client identifier used in OAuth flows
                    
                
                
                    name
                    
                        string
                        Display name shown on consent screens
                    
                
                
                    description
                    
                        string | null
                        Description of the application
                    
                
                
                    isConfidential
                    
                        boolean
                        Whether the client can securely store a secret
                    
                
                
                    redirectUris
                    
                        array of strings
                        Allowed redirect URIs after authorization
                    
                
                
                    allowedScopes
                    
                        array of strings
                        Scopes this client is allowed to request
                    
                
                
                    grantTypes
                    
                        array of strings
                        Allowed OAuth grant types
                    
                
                
                    isActive
                    
                        boolean
                        Whether the client can obtain new tokens
                    
                
                
                    accessTokenLifetime
                    
                        integer
                        Access token lifetime in seconds (default: 3600)
                    
                
                
                    refreshTokenLifetime
                    
                        integer
                        Refresh token lifetime in seconds (default: 2592000)
                    
                
                
                    createdAt
                    
                        string (ISO 8601)
                        When the client was created
                    
                
            
        
    
    
        
    

    
    

    
        ## List OAuth Clients

        
            GET
            /t/\{tenant\}/api/v1/admin/oauth-clients
        
        
Returns all OAuth clients registered in the tenant.

    
    
        
    

    
    

    
        ## Create OAuth Client

        
            POST
            /t/\{tenant\}/api/v1/admin/oauth-clients
        
        
Registers a new OAuth client application.

        
        ### Request Body

        
            
                
                    name
                    string
                    required
                
                Display name for the application
            
            
                
                    redirectUris
                    array of strings
                    required
                
                Valid callback URLs for authorization
            
            
                
                    isConfidential
                    boolean
                    optional
                
                Whether client can store a secret (default: true)
            
            
                
                    grantTypes
                    array of strings
                    optional
                
                Allowed grant types. Options: authorization_code, client_credentials, refresh_token
            
            
                
                    allowedScopes
                    array of strings
                    optional
                
                Scopes this client can request
            
        
        
        > [!WARNING]
> **Client Secret**

    
        
            Create Confidential Client
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/oauth-clients \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Backend Service",
    "redirectUris": ["https://api.example.com/callback"],
    "isConfidential": true,
    "grantTypes": ["client_credentials"],
    "allowedScopes": ["admin.read", "admin.write"]
  }'
```

            
        
        
            Creation Response
            
                
                    json
                    
                
                
```
{
  "id": "abc123-def456-...",
  "name": "Backend Service",
  "secret": "cs_live_xxxxxx...",
  // ⚠️ Secret only shown once!
  ...
}
```

            
        
    

    
    

    
        ## Retrieve OAuth Client

        
            GET
            /t/\{tenant\}/api/v1/admin/oauth-clients/\{client_id\}
        
        
Retrieves details about an OAuth client. The client secret is not returned.

    
    
        
    

    
    

    
        ## Update OAuth Client

        
            PUT
            /t/\{tenant\}/api/v1/admin/oauth-clients/\{client_id\}
        
        
Updates OAuth client settings.

    
    
        
    

    
    

    
        ## Delete OAuth Client

        
            DELETE
            /t/\{tenant\}/api/v1/admin/oauth-clients/\{client_id\}
        
        
Deletes an OAuth client. All associated tokens are immediately revoked.

    
    
        
    

    
    

    
        ## Regenerate Client Secret

        
            POST
            /t/\{tenant\}/api/v1/admin/oauth-clients/\{client_id\}/secret
        
        
Generates a new client secret. The old secret is immediately invalidated.

    
    
        
            Create Public Client (SPA)
            
                
                    python
                    
                
                
```
import requests

# Public client for single-page app
response = requests.post(
    "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/oauth-clients",
    headers={"Authorization": "Bearer sk_live_xxxxx"},
    json={
        "name": "React Dashboard",
        "isConfidential": False,  # Public client
        "redirectUris": [
            "http://localhost:3000/callback",
            "https://dashboard.example.com/callback"
        ],
        "grantTypes": ["authorization_code", "refresh_token"],
        "allowedScopes": ["openid", "profile"]
    }
)

client = response.json()
print(f"Client ID: {client['id']}")
```
