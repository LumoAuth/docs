# Authentication

        
The LumoAuth Admin API uses API keys for authentication. All API requests must include 
            a valid API key in the X-API-Key header.

    
    
        
            API Base URL
            
                
```
https://app.lumoauth.dev/api/v1
```

            
        
    

    
    

    
        ## API Keys

        
Include your API key in the `X-API-Key` header of every request:

        
            X-API-Key: your_api_key_here
        
        
        > [!WARNING]
> **Keep your API keys secure**

    
        
            Using an API Key
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users \
  -H "X-API-Key: lmk_abc123xyz..."
```

            
        
    

    
    

    
        ## Generating API Keys

        
Create API keys from your tenant portal:

        
        
1. Navigate to **Settings → API Keys** in your tenant portal
2. Click **Generate New API Key**
3. Give your key a descriptive name (e.g., "Production Server", "CI/CD Pipeline")
4. Select the appropriate scopes for your use case
5. Copy the generated key immediately - it won't be shown again

        
        > [!NOTE]
> **API Key Format**

    

    
    

    
        ## API Key Scopes

        
When creating an API key, assign scopes to control what resources it can access:

        
        
| Scope | Description |
| --- | --- |
| `admin:read` | Read access to all admin resources |
| `admin:write` | Write access to all admin resources |
| `admin:users` | Manage users (create, update, delete) |
| `admin:roles` | Manage roles and permissions |
| `admin:groups` | Manage groups and membership |
| `admin:clients` | Manage OAuth clients |
| `admin:webhooks` | Manage webhooks |
| `admin:audit` | Access audit logs |

        > [!NOTE]
> **Scope Principle**

    
        
            Example Request
            
                
                    bash
                    
                
                
```
# API key with admin:read scope
curl https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users \
  -H "X-API-Key: lmk_abc123..."
```

            
        
    

    
    

    
        ## Authentication Errors

        
When authentication fails, you'll receive one of these errors:

        
        
| Status | Error | Description |
| --- | --- | --- |
| `401` | Unauthorized | No API key provided or key is invalid/revoked |
| `403` | Forbidden | API key is valid but lacks required scopes |
