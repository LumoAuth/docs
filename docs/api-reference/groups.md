# Groups

                
Groups organize users and can inherit roles for all members.

            
        

        
Groups provide organizational structure for users and simplify permission management at scale.
            When a role is assigned to a group, all group members automatically inherit that role's permissions.
            Groups can also be used for team management, department organization, or any logical user grouping.

    
    
        
            The Group Object
            
                
                    json
                    
                
                
```
{
  "id": 7,
  "name": "Engineering Team",
  "slug": "engineering",
  "description": "Product engineering team",
  "memberCount": 24,
  "roles": [
    {"slug": "developer"},
    {"slug": "code-reviewer"}
  ],
  "createdAt": "2024-01-05T14:00:00Z",
  "updatedAt": "2024-02-15T10:30:00Z"
}
```

            
        
    

    
    

    
        ## The Group Object

        
        
            Attributes
            
                
                    id
                    
                        integer
                        Unique identifier for the group
                    
                
                
                    name
                    
                        string
                        Human-readable name of the group
                    
                
                
                    slug
                    
                        string
                        URL-safe identifier for the group
                    
                
                
                    description
                    
                        string | null
                        Description of the group's purpose
                    
                
                
                    memberCount
                    
                        integer
                        Number of users in this group
                    
                
                
                    roles
                    
                        array
                        Roles assigned to this group (members inherit these)
                    
                
                
                    createdAt
                    
                        string (ISO 8601)
                        When the group was created
                    
                
                
                    updatedAt
                    
                        string (ISO 8601)
                        When the group was last updated
                    
                
            
        
    
    

    
    

    
        ## List Groups

        
            GET
            /t/\{tenant\}/api/v1/admin/groups
        
        
Returns a paginated list of all groups in the tenant.

        
        ### Query Parameters

        
            
                
                    search
                    string
                    optional
                
                Search groups by name or slug
            
            
                
                    page
                    integer
                    optional
                
                Page number for pagination (default: 1)
            
            
                
                    limit
                    integer
                    optional
                
                Items per page (default: 20, max: 100)
            
        
    
    

    
    

    
        ## Create Group

        
            POST
            /t/\{tenant\}/api/v1/admin/groups
        
        
Creates a new group in the tenant.

        
        ### Request Body

        
            
                
                    name
                    string
                    required
                
                Display name for the group
            
            
                
                    slug
                    string
                    optional
                
                URL-safe identifier. Auto-generated if not provided.
            
            
                
                    description
                    string
                    optional
                
                Description of the group's purpose
            
        
    
    
        
            Create Group
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/groups \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Design Team",
    "description": "UI/UX designers and product designers"
  }'
```

            
        
    

    
    

    
        ## Retrieve Group

        
            GET
            /t/\{tenant\}/api/v1/admin/groups/\{group_id\}
        
        
Retrieves details about a specific group including its roles and member count.

    
    

    
    

    
        ## Update Group

        
            PUT
            /t/\{tenant\}/api/v1/admin/groups/\{group_id\}
        
        
Updates group properties like name and description.

    
    

    
    

    
        ## Delete Group

        
            DELETE
            /t/\{tenant\}/api/v1/admin/groups/\{group_id\}
        
        
Permanently deletes a group. Members are not deleted but lose group-inherited permissions.

    
    

    
    

    
        ## List Group Members

        
            GET
            /t/\{tenant\}/api/v1/admin/groups/\{group_id\}/members
        
        
Returns all users that are members of this group.

    
    

    
    

    
        ## Add Members to Group

        
            POST
            /t/\{tenant\}/api/v1/admin/groups/\{group_id\}/members
        
        
Adds one or more users to the group.

        
        ### Request Body

        
            
                
                    userIds
                    array of integers
                    required
                
                Array of user IDs to add to the group
            
        
    
    
        
            Add Members
            
                
                    python
                    
                
                
```
import requests

# Add users to the engineering group
response = requests.post(
    "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/groups/engineering/members",
    headers={"Authorization": "Bearer sk_live_xxxxx"},
    json={"userIds": [101, 102, 103]}
)

print(response.json())
```

            
        
    

    
    

    
        ## Remove Member from Group

        
            DELETE
            /t/\{tenant\}/api/v1/admin/groups/\{group_id\}/members/\{user_id\}
        
        
Removes a user from the group. The user loses all group-inherited permissions.

    
    

    
    

    
        ## Update Group Roles

        
            PUT
            /t/\{tenant\}/api/v1/admin/groups/\{group_id\}/roles
        
        
Assigns roles to the group. All group members inherit these roles.

        
        ### Request Body

        
            
                
                    roles
                    array of strings
                    required
                
                Role slugs to assign. Pass empty array to remove all roles.
            
        
        
        > [!NOTE]
> **Permission Inheritance**

    
        
            Assign Roles to Group
            
                
                    bash
                    
                
                
```
curl -X PUT https://app.lumoauth.dev/t/acme-corp/api/v1/admin/groups/engineering/roles \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"roles": ["developer", "deploy-staging"]}'
```
