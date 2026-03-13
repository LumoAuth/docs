# Audit Logs

                
Track all security-relevant events in your tenant.

            
        

        
Audit logs provide a comprehensive, immutable record of all security-relevant events. Use them
            for compliance, security investigations, and monitoring user activity. Logs are retained for
            the duration specified in your plan.

    
    
        
            Audit Log Object
            
                
                    json
                    
                
                
```
{
  "id": "log_abc123xyz",
  "action": "user_created",
  "category": "user_management",
  "actor": {
    "type": "user",
    "id": 123,
    "email": "admin@example.com"
  },
  "target": {
    "type": "user",
    "id": 456,
    "email": "newuser@example.com"
  },
  "outcome": "success",
  "ipAddress": "203.0.113.45",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "roles_assigned": ["developer"]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

            
        
    

    
    

    
        
            ## The Audit Log Object

            
            
                Attributes
                
                    
                        id
                        
                            string
                            Unique identifier for the log entry
                        
                    
                    
                        action
                        
                            string
                            The action that was performed
                        
                    
                    
                        category
                        
                            string
                            Category: authentication, authorization, user_management, etc.
                        
                    
                    
                        actor
                        
                            object
                            Who performed the action (user, agent, or system)
                        
                    
                    
                        target
                        
                            object | null
                            The resource affected by the action
                        
                    
                    
                        outcome
                        
                            string
                            Result: `success`, `failure`, `error`
                        
                    
                    
                        ipAddress
                        
                            string
                            IP address of the request
                        
                    
                    
                        userAgent
                        
                            string
                            User agent of the client
                        
                    
                    
                        metadata
                        
                            object
                            Additional context about the event
                        
                    
                    
                        timestamp
                        
                            string (ISO 8601)
                            When the event occurred
                        
                    
                
            
        
    
    
    

    
    

    
        
            ## Audit Categories

            
            
| Category | Actions |
| --- | --- |
| `authentication` | login, logout, login_failed, mfa_verified, password_reset |
| `authorization` | permission_check, access_denied, role_assigned |
| `user_management` | user_created, user_updated, user_deleted, user_blocked |
| `token_management` | token_issued, token_revoked, token_refreshed |
| `configuration` | settings_changed, webhook_created, policy_updated |

        
    
    
    

    
    

    
        
            ## List Audit Logs

            
                GET
                /t/\{tenant\}/api/v1/admin/audit-logs
            
            
Returns audit logs with optional filtering.

            
            ### Query Parameters

            
                
                    
                        action
                        string
                        optional
                    
                    Filter by action type
                
                
                    
                        category
                        string
                        optional
                    
                    Filter by category
                
                
                    
                        actorId
                        string
                        optional
                    
                    Filter by actor (user or agent ID)
                
                
                    
                        targetId
                        string
                        optional
                    
                    Filter by affected resource ID
                
                
                    
                        outcome
                        string
                        optional
                    
                    Filter by outcome (success, failure, error)
                
                
                    
                        startDate
                        string (ISO 8601)
                        optional
                    
                    Filter logs after this date
                
                
                    
                        endDate
                        string (ISO 8601)
                        optional
                    
                    Filter logs before this date
                
            
        
    
    
        
            Query Failed Logins
            
                
                    bash
                    
                
                
```
curl "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/audit-logs?action=login_failed&outcome=failure" \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        

        
            Query by Date Range
            
                
                    python
                    
                
                
```
import requests
from datetime import datetime, timedelta

# Get last 7 days of authentication logs
end_date = datetime.now().isoformat()
start_date = (datetime.now() - timedelta(days=7)).isoformat()

response = requests.get(
    "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/audit-logs",
    headers={"Authorization": "Bearer sk_live_xxxxx"},
    params={
        "category": "authentication",
        "startDate": start_date,
        "endDate": end_date
    }
)

for log in response.json()["data"]:
    print(f"{log['timestamp']}: {log['action']} - {log['outcome']}")
```

            
        
    

    
    

    
        
            ## Retrieve Audit Log

            
                GET
                /t/\{tenant\}/api/v1/admin/audit-logs/\{log_id\}
            
            
Returns detailed information about a specific audit log entry.

        
    
    
        
            Retrieve Log Entry
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/admin/audit-logs/log_abc123xyz \
  -H "Authorization: Bearer sk_live_xxxxx"
```

            
        
    

    
    

    
        
            ## Export Audit Logs

            
                POST
                /t/\{tenant\}/api/v1/admin/audit-logs/export
            
            
Exports audit logs to CSV or JSON format for compliance reporting.
