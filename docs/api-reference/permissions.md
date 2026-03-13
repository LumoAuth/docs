# Permissions

                
Permissions define specific capabilities that can be assigned to roles.

            
        

        
Permissions are the fundamental building blocks of access control. They represent specific actions
            that users can perform within your application. Permissions are assigned to roles, and users gain
            permissions through their role assignments.

        > [!NOTE]
> **Permission Naming Convention**

    
        
            Common Permission Patterns
            
                
                    json
                    
                
                
```
// CRUD pattern for a resource
[
  {"slug": "products.read"},
  {"slug": "products.create"},
  {"slug": "products.update"},
  {"slug": "products.delete"}
]

// Action-based permissions
[
  {"slug": "reports.export"},
  {"slug": "users.invite"},
  {"slug": "billing.manage"}
]
```

            
        
    

    
    

    
        
            ## The Permission Object

            
            
                Attributes
                
                    
                        id
                        
                            integer
                            Unique identifier for the permission
                        
                    
                    
                        name
                        
                            string
                            Human-readable name of the permission
                        
                    
                    
                        slug
                        
                            string
                            URL-safe identifier. Use this in API requests and checks.
                        
                    
                    
                        description
                        
                            string | null
                            Description of what this permission grants
                        
                    
                    
                        category
                        
                            string | null
                            Optional category for grouping related permissions
                        
                    
                    
                        isSystem
                        
                            boolean
                            Whether this is a system-defined permission
                        
                    
                    
                        roleCount
                        
                            integer
                            Number of roles that include this permission
                        
                    
                
            
        
    
    
        
            The Permission Object
            
                
                    json
                    
                
                
```
{
  "id": 156,
  "name": "Create Orders",
  "slug": "orders.create",
  "description": "Allows creating new orders",
  "category": "Orders",
  "isSystem": false,
  "roleCount": 3
}
```

            
        
    

    
    

    
        
            ## List Permissions

            
                GET
                /t/\{tenant\}/api/v1/admin/permissions
            
            
Returns all permissions available in the tenant.

            
            ### Query Parameters

            
                
                    
                        search
                        string
                        optional
                    
                    Search by name, slug, or description
                
                
                    
                        category
                        string
                        optional
                    
                    Filter by category
                
                
                    
                        isSystem
                        boolean
                        optional
                    
                    Filter by system/custom status
                
            
        
    
    
        
            List by Category
            
                
                    python
                    
                
                
```
import requests

# Get all order-related permissions
response = requests.get(
    "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/permissions",
    headers={"Authorization": "Bearer sk_live_xxxxx"},
    params={"category": "Orders"}
)

permissions = response.json()["data"]
for p in permissions:
    print(f"{p['slug']}: {p['name']}")
```

            
        
    

    
    

    
        
            ## Create Permission

            
                POST
                /t/\{tenant\}/api/v1/admin/permissions
            
            
Creates a new custom permission.

            
            ### Request Body

            
                
                    
                        name
                        string
                        required
                    
                    Human-readable name for the permission
                
                
                    
                        slug
                        string
                        optional
                    
                    URL-safe identifier. Auto-generated if not provided.
                
                
                    
                        description
                        string
                        optional
                    
                    Description of what the permission grants
                
                
                    
                        category
                        string
                        optional
                    
                    Category for organizing permissions
                
            
        
    
    
        
            Create Permission
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/permissions \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Export Reports",
    "slug": "reports.export",
    "description": "Allows exporting reports to CSV/PDF",
    "category": "Reports"
  }'
```

            
        
    

    
    

    
        
            ## Retrieve Permission

            
                GET
                /t/\{tenant\}/api/v1/admin/permissions/\{permission_id\}
            
            
Retrieves details about a specific permission.

        
    
    
        
            Retrieve Permission
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/admin/permissions/156 \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        
            ## Update Permission

            
                PUT
                /t/\{tenant\}/api/v1/admin/permissions/\{permission_id\}
            
            
Updates a custom permission. System permissions cannot be modified.

        
    
    
        
            Update Permission
            
                
                    bash
                    
                
                
```
curl -X PUT https://app.lumoauth.dev/t/acme-corp/api/v1/admin/permissions/156 \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"description": "Updated description"}'
```

            
        
    

    
    

    
        
            ## Delete Permission

            
                DELETE
                /t/\{tenant\}/api/v1/admin/permissions/\{permission_id\}
            
            
Deletes a custom permission. The permission is automatically removed from all roles.

        
    
    
        
            Delete Permission
            
                
                    bash
                    
                
                
```
curl -X DELETE https://app.lumoauth.dev/t/acme-corp/api/v1/admin/permissions/156 \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        
            ## Get Roles with Permission

            
                GET
                /t/\{tenant\}/api/v1/admin/permissions/\{permission_id\}/roles
            
            
Lists all roles that include this permission.

        
    
    
        
            Get Roles with Permission
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/admin/permissions/156/roles \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        
            ## Checking Permissions

            
To check if a user has a specific permission, use the ABAC Check endpoint. This is more
                comprehensive than simple role checking as it considers all permission sources.

            
                POST
                /api/v1/abac/check
            
            
See [ABAC Check](/api-reference/authorization/check) for full documentation.
