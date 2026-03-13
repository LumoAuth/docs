# Roles

                
Roles are collections of permissions that can be assigned to users or groups.

            
        

        
Roles provide a way to group permissions together and assign them to users or groups. When a user is
            assigned a role, they inherit all permissions associated with that role. Roles can be system-defined
            (built-in) or custom (created by tenant administrators).

    
    
        
            The Role Object
            
                
                    json
                    
                
                
```
{
  "id": 42,
  "name": "Developer",
  "slug": "developer",
  "description": "Standard developer access",
  "isSystem": false,
  "userCount": 15,
  "permissions": [
    {"slug": "code.read", "name": "Read Code"},
    {"slug": "code.write", "name": "Write Code"}
  ],
  "createdAt": "2024-01-10T08:00:00Z"
}
```

            
        
    

    
    

    
        ## The Role Object

        
        
            Attributes
            
                
                    id
                    
                        integer
                        Unique identifier for the role
                    
                
                
                    name
                    
                        string
                        Human-readable name of the role
                    
                
                
                    slug
                    
                        string
                        URL-safe identifier for the role. Used in API requests.
                    
                
                
                    description
                    
                        string | null
                        Description of the role's purpose
                    
                
                
                    isSystem
                    
                        boolean
                        Whether this is a system-defined role. System roles cannot be modified or deleted.
                    
                
                
                    permissions
                    
                        array
                        Permissions assigned to this role (expanded in detail view)
                    
                
                
                    userCount
                    
                        integer
                        Number of users assigned to this role
                    
                
                
                    createdAt
                    
                        string (ISO 8601)
                        When the role was created
                    
                
            
        
    
    
        
            System Roles
            
                
                    json
                    
                
                
```
// Built-in system roles
[
  {"slug": "admin", "name": "Administrator"},
  {"slug": "user", "name": "User"},
  {"slug": "tenant_admin", "name": "Tenant Administrator"}
]
```

            
        
    

    
    

    
        ## List Roles

        
            GET
            /t/\{tenant\}/api/v1/admin/roles
        
        
Returns all roles available in the tenant, including system and custom roles.

        
        ### Query Parameters

        
            
                
                    search
                    string
                    optional
                
                Search by name or slug
            
            
                
                    isSystem
                    boolean
                    optional
                
                Filter by system/custom status
            
        
    
    
        
    

    
    

    
        ## Create Role

        
            POST
            /t/\{tenant\}/api/v1/admin/roles
        
        
Creates a new custom role.

        
        ### Request Body

        
            
                
                    name
                    string
                    required
                
                Human-readable name for the role
            
            
                
                    slug
                    string
                    optional
                
                URL-safe identifier. Auto-generated from name if not provided.
            
            
                
                    description
                    string
                    optional
                
                Description of the role's purpose
            
            
                
                    permissions
                    array of strings
                    optional
                
                Permission slugs to assign to this role
            
        
    
    
        
            Create Role
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/roles \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Manager",
    "description": "Can manage projects and team members",
    "permissions": ["projects.read", "projects.write", "team.manage"]
  }'
```

            
        
    

    
    

    
        ## Retrieve Role

        
            GET
            /t/\{tenant\}/api/v1/admin/roles/\{role_id\}
        
        
Retrieves a role by ID or slug.

    
    
        
    

    
    

    
        ## Update Role

        
            PUT
            /t/\{tenant\}/api/v1/admin/roles/\{role_id\}
        
        
Updates a custom role. System roles cannot be modified.

    
    
        
    

    
    

    
        ## Delete Role

        
            DELETE
            /t/\{tenant\}/api/v1/admin/roles/\{role_id\}
        
        
Deletes a custom role. System roles cannot be deleted.

        
        > [!WARNING]
> **Impact on Users**

    
        
    

    
    

    
        ## Update Role Permissions

        
            PUT
            /t/\{tenant\}/api/v1/admin/roles/\{role_id\}/permissions
        
        
Replaces all permissions assigned to a role.

        
        ### Request Body

        
            
                
                    permissions
                    array of strings
                    required
                
                Array of permission slugs. Pass empty array to remove all permissions.
            
        
    
    
        
            Update Permissions
            
                
                    bash
                    
                
                
```
curl -X PUT https://app.lumoauth.dev/t/acme-corp/api/v1/admin/roles/developer/permissions \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"permissions": ["code.read", "code.write", "deploy.staging"]}'
```

            
        
    

    
    

    
        ## Get Users with Role

        
            GET
            /t/\{tenant\}/api/v1/admin/roles/\{role_id\}/users
        
        
Lists all users assigned to a specific role.
