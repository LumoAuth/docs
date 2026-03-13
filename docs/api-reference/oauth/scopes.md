# OAuth Scopes

        
OAuth scopes are strings that define the specific access permissions a client can request.
            Users see requested scopes on the consent screen and can approve or deny access. Scopes
            let you implement fine-grained access control for your API.

    
    
        
            The Scope Object
            
                
                    json
                    
                
                
```
{
  "id": 12,
  "name": "orders.read",
  "description": "View your orders and order history",
  "isDefault": false,
  "isSystem": false
}
```

            
        
    

    
    

    
        ## Built-in Scopes

        
LumoAuth provides standard OpenID Connect scopes and admin scopes.

        
        
| Scope | Description |
| --- | --- |
| `openid` | Required for OpenID Connect. Returns an ID token. |
| `profile` | Access to user's name and profile information |
| `email` | Access to user's email address |
| `offline_access` | Allows refresh tokens for long-lived access |
| `admin.read` | Read access to admin API endpoints |
| `admin.write` | Write access to admin API endpoints |

    
    
        
            Request Scopes
            
                
                    text
                    
                
                
```
# Authorization URL with scopes
https://app.lumoauth.dev/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://app.example.com/callback&
  response_type=code&
  scope=openid profile email orders.read
```

            
        
    

    
    

    
        ## The Scope Object

        
        
            Attributes
            
                
                    id
                    
                        integer
                        Unique identifier for the scope
                    
                
                
                    name
                    
                        string
                        The scope string used in OAuth requests
                    
                
                
                    description
                    
                        string
                        User-facing description shown on consent screen
                    
                
                
                    isDefault
                    
                        boolean
                        Whether the scope is requested by default
                    
                
                
                    isSystem
                    
                        boolean
                        Whether this is a built-in scope
                    
                
            
        
    
    

    
    

    
        ## List Scopes

        
            GET
            /t/\{tenant\}/api/v1/admin/scopes
        
        
Returns all scopes available in the tenant.

    
    

    
    

    
        ## Create Scope

        
            POST
            /t/\{tenant\}/api/v1/admin/scopes
        
        
Creates a new custom scope.

        
        ### Request Body

        
            
                
                    name
                    string
                    required
                
                The scope identifier (e.g., `orders.read`)
            
            
                
                    description
                    string
                    required
                
                User-facing description for consent screen
            
            
                
                    isDefault
                    boolean
                    optional
                
                Include by default when no scopes specified
            
        
    
    
        
            Create Custom Scope
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/scopes \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "billing.manage",
    "description": "Manage billing and subscriptions"
  }'
```

            
        
    

    
    

    
        ## Update Scope

        
            PUT
            /t/\{tenant\}/api/v1/admin/scopes/\{scope_id\}
        
        
Updates a custom scope. System scopes cannot be modified.

    
    

    
    

    
        ## Delete Scope

        
            DELETE
            /t/\{tenant\}/api/v1/admin/scopes/\{scope_id\}
        
        
Deletes a custom scope. The scope is removed from all clients.

    
    

    
    

    
        ## Scope Best Practices

        
        > [!NOTE]
> **Naming Convention**

    
        
            Scope Example Usage
            
                
                    python
                    
                
                
```
import requests

# Define scopes for your application
scopes_to_create = [
    {"name": "orders.read", "description": "View orders"},
    {"name": "orders.write", "description": "Create and modify orders"},
    {"name": "orders.delete", "description": "Cancel orders"},
]

for scope in scopes_to_create:
    response = requests.post(
        "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/scopes",
        headers={"Authorization": "Bearer sk_live_xxxxx"},
        json=scope
    )
    print(f"Created: {scope['name']}")
```
