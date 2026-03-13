# Sessions

                
Manage user authentication sessions.

            
        

        
Sessions represent active user logins. Each session tracks when and how a user authenticated,
            their device information, and can be individually revoked for security purposes.

    
    
        
            The Session Object
            
                
                    json
                    
                
                
```
{
  "id": "sess_abc123xyz",
  "userId": 456,
  "ipAddress": "203.0.113.45",
  "userAgent": "Mozilla/5.0 (Macintosh...)",
  "device": {
    "type": "desktop",
    "os": "macOS",
    "browser": "Chrome"
  },
  "location": {
    "city": "New York",
    "country": "US"
  },
  "authMethod": "password",
  "mfaVerified": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "lastActiveAt": "2024-01-15T14:30:00Z",
  "expiresAt": "2024-01-16T10:00:00Z"
}
```

            
        
    

    
    

    
        
            ## The Session Object

            
            
                Attributes
                
                    
                        id
                        
                            string
                            Unique session identifier
                        
                    
                    
                        userId
                        
                            integer
                            The user this session belongs to
                        
                    
                    
                        ipAddress
                        
                            string
                            IP address of the session
                        
                    
                    
                        userAgent
                        
                            string
                            Browser/client user agent string
                        
                    
                    
                        device
                        
                            object
                            Parsed device information (type, os, browser)
                        
                    
                    
                        location
                        
                            object | null
                            Geographic location (city, country, if available)
                        
                    
                    
                        authMethod
                        
                            string
                            How user authenticated (password, social, sso)
                        
                    
                    
                        mfaVerified
                        
                            boolean
                            Whether MFA was completed
                        
                    
                    
                        createdAt
                        
                            string (ISO 8601)
                            When the session was created
                        
                    
                    
                        lastActiveAt
                        
                            string (ISO 8601)
                            Last activity timestamp
                        
                    
                    
                        expiresAt
                        
                            string (ISO 8601)
                            When the session expires
                        
                    
                
            
        
    
    
    

    
    

    
        
            ## List User Sessions

            
                GET
                /t/\{tenant\}/api/v1/admin/users/\{user_id\}/sessions
            
            
Returns all active sessions for a specific user.

        
    
    
        
            List User Sessions
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users/456/sessions \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        
            ## Revoke Session

            
                DELETE
                /t/\{tenant\}/api/v1/admin/users/\{user_id\}/sessions/\{session_id\}
            
            
Immediately terminates a specific session. The user will need to log in again.

        
    
    
        
            Revoke Session
            
                
                    bash
                    
                
                
```
curl -X DELETE https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users/456/sessions/sess_abc123xyz \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        
            ## Revoke All User Sessions

            
                DELETE
                /t/\{tenant\}/api/v1/admin/users/\{user_id\}/sessions
            
            
Terminates all active sessions for a user. Use for security incidents or password changes.

            
            > [!WARNING]
> **Immediate Effect**

    
    
        
            Revoke All Sessions
            
                
                    python
                    
                
                
```
import requests

# Revoke all sessions after password change
response = requests.delete(
    "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users/456/sessions",
    headers={"Authorization": "Bearer sk_live_xxxxx"}
)

if response.status_code == 200:
    print("All sessions revoked")
```

            
        
    

    
    

    
        
            ## List All Active Sessions (Admin)

            
                GET
                /t/\{tenant\}/api/v1/admin/sessions
            
            
Returns all active sessions across all users. Useful for security monitoring.

            
            ### Query Parameters

            
                
                    
                        userId
                        integer
                        optional
                    
                    Filter by specific user
                
                
                    
                        ipAddress
                        string
                        optional
                    
                    Filter by IP address
