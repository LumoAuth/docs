# Users

                
User objects represent identities that can authenticate with your applications.

            
        

        
Users are the core identity objects in LumoAuth. Each user belongs to a single tenant and can have 
            roles, group memberships, and custom attributes. Users can authenticate via password, social login, 
            passkeys, or enterprise SSO.

    
    
        
            Endpoints
            
                
```
GET    /admin/users
POST   /admin/users
GET    /admin/users/:id
PUT    /admin/users/:id
DELETE /admin/users/:id
POST   /admin/users/:id/block
POST   /admin/users/:id/unblock
PUT    /admin/users/:id/roles
PUT    /admin/users/:id/groups
PUT    /admin/users/:id/password
POST   /admin/users/:id/password-reset
POST   /admin/users/:id/mfa/reset
```

            
        
    

    
    

    
        ## The User Object

        
        
            
                
                    id
                    string (uuid)
                
                Unique identifier for the user
            
            
                
                    email
                    string
                
                User's email address. Must be unique within the tenant.
            
            
                
                    username
                    string | null
                
                Optional username for the user
            
            
                
                    name
                    string | null
                
                User's full name (display name)
            
            
                
                    givenName
                    string | null
                
                User's first name
            
            
                
                    familyName
                    string | null
                
                User's last name
            
            
                
                    emailVerified
                    boolean
                
                Whether the user's email has been verified
            
            
                
                    isActive
                    boolean
                
                Whether the user account is active
            
            
                
                    blocked
                    boolean
                
                Whether the user is blocked from logging in
            
            
                
                    mfaEnabled
                    boolean
                
                Whether multi-factor authentication is enabled
            
            
                
                    roles
                    array
                
                Roles assigned to this user
            
            
                
                    groups
                    array
                
                Groups the user belongs to
            
            
                
                    createdAt
                    string (ISO 8601)
                
                When the user was created
            
            
                
                    lastLoginAt
                    string | null
                
                When the user last logged in
            
        
    
    
        
            The User Object
            
                
                    json
                    
                
                
```
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "givenName": "John",
  "familyName": "Doe",
  "picture": "https://example.com/avatar.jpg",
  "emailVerified": true,
  "phoneNumber": "+15551234567",
  "isActive": true,
  "blocked": false,
  "mfaEnabled": true,
  "roles": [
    {"slug": "admin", "name": "Administrator"}
  ],
  "groups": [
    {"slug": "engineering", "name": "Engineering"}
  ],
  "createdAt": "2024-01-15T10:30:00Z",
  "lastLoginAt": "2024-02-01T14:22:00Z",
  "loginCount": 42
}
```

            
        
    

    
    

    
        ## List Users

        
            GET
            /t/\{tenant\}/api/v1/admin/users
        
        
Returns a paginated list of users in the tenant.

        
        ### Query Parameters

        
            
                
                    search
                    string
                    optional
                
                Search by email, name, or username
            
            
                
                    role
                    string
                    optional
                
                Filter by role slug
            
            
                
                    blocked
                    boolean
                    optional
                
                Filter by blocked status
            
            
                
                    page
                    integer
                    optional
                
                Page number (default: 1)
            
            
                
                    limit
                    integer
                    optional
                
                Items per page (default: 20, max: 100)
            
        
    
    
        
            Request
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        

        
            Response
            
                
                    json
                    
                
                
```
{
  "data": [
    {
      "id": "550e8400...",
      "email": "john@example.com",
      "name": "John Doe"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150
  }
}
```

            
        
    

    
    

    
        ## Create User

        
            POST
            /t/\{tenant\}/api/v1/admin/users
        
        
Creates a new user in the tenant.

        
        ### Request Body

        
            
                
                    email
                    string
                    required
                
                User's email address. Must be unique within the tenant.
            
            
                
                    password
                    string
                    optional
                
                Initial password. If not provided, user must reset password on first login.
            
            
                
                    name
                    string
                    optional
                
                User's full display name
            
            
                
                    roles
                    array of strings
                    optional
                
                Role slugs to assign to the user
            
            
                
                    groups
                    array of strings
                    optional
                
                Group slugs to add the user to
            
            
                
                    emailVerified
                    boolean
                    optional
                
                Mark email as verified. Default: `false`
            
        
    
    
        
            Request
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "name": "New User",
    "password": "SecurePass123!",
    "roles": ["developer"],
    "emailVerified": true
  }'
```

            
        

        
            Response
            
                
                    json
                    
                
                
```
{
  "data": {
    "id": "550e8400-e29b-41d4...",
    "email": "newuser@example.com",
    "name": "New User",
    "emailVerified": true,
    "roles": [
      {"slug": "developer"}
    ],
    "createdAt": "2024-02-01T..."
  },
  "message": "User created"
}
```

            
        
    

    
    

    
        ## Retrieve User

        
            GET
            /t/\{tenant\}/api/v1/admin/users/\{user_id\}
        
        
Retrieves a user by ID or email address.

        ### Path Parameters

        
            
                
                    user_id
                    string
                    required
                
                The user's ID (UUID) or email address
            
        
    
    
        
            Request
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users/550e8400... \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        ## Update User

        
            PUT
            /t/\{tenant\}/api/v1/admin/users/\{user_id\}
        
        
Updates a user's profile information. Only include the fields you want to update.

    
    
        
            Request
            
                
                    bash
                    
                
                
```
curl -X PUT https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users/550e8400... \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'
```

            
        
    

    
    

    
        ## Delete User

        
            DELETE
            /t/\{tenant\}/api/v1/admin/users/\{user_id\}
        
        
Permanently deletes a user and all associated data.

        
        > [!WARNING]
> **Irreversible Action**

    
        
            Request
            
                
                    bash
                    
                
                
```
curl -X DELETE https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users/550e8400... \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        ## Block User

        
            POST
            /t/\{tenant\}/api/v1/admin/users/\{user_id\}/block
        
        
Blocks a user from logging in. All active sessions are immediately invalidated.

    
    
        
            Request
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users/550e8400.../block \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        ## Update User Roles

        
            PUT
            /t/\{tenant\}/api/v1/admin/users/\{user_id\}/roles
        
        
Replaces all roles assigned to a user.

        
        ### Request Body

        
            
                
                    roles
                    array of strings
                    required
                
                Array of role slugs to assign. Pass empty array to remove all roles.
            
        
    
    
        
            Request
            
                
                    bash
                    
                
                
```
curl -X PUT https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users/550e8400.../roles \
  -H "Authorization: Bearer sk_live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{"roles": ["admin", "developer"]}'
```

            
        
    

    
    

    
        ## Set User Password

        
            PUT
            /t/\{tenant\}/api/v1/admin/users/\{user_id\}/password
        
        
Directly sets a new password for the user (admin action).

        
        ### Request Body

        
            
                
                    password
                    string
                    required
                
                New password. Must meet policy requirements (min 8 characters).
