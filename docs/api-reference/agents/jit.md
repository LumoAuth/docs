# JIT Permissions

                
Just-in-Time permission requests for AI agents that need elevated access.

            
        

        
JIT (Just-in-Time) Permissions allow AI agents to request elevated access **only when needed**,
            with user approval for sensitive operations. This follows the principle of least privilege—agents
            start with minimal permissions and escalate only when necessary.

        > [!NOTE]
> **Why JIT Permissions?**

    
        
            Start a JIT Task
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/jit/task \
  -H "Authorization: Bearer agent_token" \
  -H "Content-Type: application/json" \
  -d '{
    "task_description": "Send a meeting invitation to the team",
    "required_scopes": ["calendar:write", "email:send"],
    "duration": 600
  }'
```

            
        
    

    
    

    
        ## JIT Flow

        
1. **Agent starts task** - Agent begins work with baseline permissions
2. **Needs more access** - Agent realizes it needs elevated permissions
3. **Request JIT** - Agent calls the JIT request endpoint
4. **User notified** - User receives approval request (push, email, etc.)
5. **User approves** - User reviews and approves/denies
6. **Token exchanged** - Agent receives time-limited elevated token
7. **Task completed** - Agent completes work with new permissions
8. **Permissions expire** - Elevated access is automatically revoked

    
    
        
            Task Created Response
            
                
                    json
                    
                
                
```
{
  "task_id": "jit_task_abc123",
  "status": "pending",
  "approval_url": "https://app.lumoauth.dev/approve/jit_task_abc123",
  "expires_in": 300
}
```

            
        
    

    
    

    
        ## Start a Task

        
            POST
            /t/\{tenant\}/api/v1/jit/task
        
        
        
Register a new agent task and its required permissions.

        
        ### Request Body

        
            
                
                    task_description
                    string
                    required
                
                Human-readable description of what the agent wants to do
            
            
                
                    required_scopes
                    array
                    required
                
                Scopes the agent needs to complete the task
            
            
                
                    duration
                    integer
                    optional
                
                Requested permission duration in seconds (default: 300)
            
            
                
                    resources
                    array
                    optional
                
                Specific resources the agent needs to access
            
        
        
        ### Response

        
            Task Response
            
                
                    task_id
                    
                        string
                        Unique identifier for tracking this task
                    
                
                
                    status
                    
                        string
                        `pending`, `approved`, `denied`, or `expired`
                    
                
                
                    approval_url
                    
                        string
                        URL where user can approve the request
                    
                
            
        
    
    
        
            Create Task Request
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/jit/task \
  -H "Authorization: Bearer agent_token" \
  -H "Content-Type: application/json" \
  -d '{
    "task_description": "Send a meeting invitation to the team",
    "required_scopes": ["calendar:write", "email:send"],
    "duration": 600
  }'
```

            
        
    

    
    

    
        ## Request Permission Elevation

        
            POST
            /t/\{tenant\}/api/v1/jit/request
        
        
        
Request specific elevated permissions for an active task.

        
        ### Request Body

        
            
                
                    task_id
                    string
                    required
                
                Task ID from the /jit/task response
            
            
                
                    scope
                    string
                    required
                
                Specific scope being requested
            
            
                
                    justification
                    string
                    required
                
                Why this permission is needed (shown to user)
            
        
    
    
        
            Request Elevation
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/jit/request \
  -H "Authorization: Bearer agent_token" \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "jit_task_abc123",
    "scope": "payment:read",
    "justification": "Need to verify payment status for the invoice"
  }'
```

            
        
    

    
    

    
        ## Poll for Approval

        
            GET
            /t/\{tenant\}/api/v1/jit/status/\{task_id\}
        
        
        
Check if the user has approved the permission request.

        
        
| Status | Meaning | Action |
| --- | --- | --- |
| `pending` | Waiting for user approval | Keep polling (respect interval) |
| `approved` | User approved the request | Exchange for elevated token |
| `denied` | User denied the request | Handle gracefully, don't retry |
| `expired` | Request timed out | Create a new request if needed |

    
    
        
            Poll for Status
            
                
                    bash
                    
                
                
```
curl https://app.lumoauth.dev/t/acme-corp/api/v1/jit/status/jit_task_abc123 \
  -H "Authorization: Bearer agent_token"
```

            
        

        
            Approved Status
            
                
                    json
                    
                
                
```
{
  "task_id": "jit_task_abc123",
  "status": "approved",
  "approved_scopes": ["calendar:write", "email:send"],
  "approved_by": "user_abc123",
  "approved_at": "2025-02-01T10:30:00Z"
}
```

            
        
    

    
    

    
        ## Exchange for Elevated Token

        
            POST
            /t/\{tenant\}/api/v1/oauth/token
        
        
        
After approval, exchange the task approval for an elevated access token.

        
        
            
                
                    grant_type
                    string
                
                `urn:ietf:params:oauth:grant-type:token-exchange`
            
            
                
                    subject_token
                    string
                
                Your current access token
            
            
                
                    subject_token_type
                    string
                
                `urn:ietf:params:oauth:token-type:access_token`
            
            
                
                    scope
                    string
                
                The approved elevated scopes
            
            
                
                    jit_task_id
                    string
                
                The approved task ID
            
        
    
    
        
            Exchange for Elevated Token
            
                
                    bash
                    
                
                
```
curl -X POST https://app.lumoauth.dev/t/acme-corp/api/v1/oauth/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:token-exchange" \
  -d "subject_token=agent_current_token" \
  -d "subject_token_type=urn:ietf:params:oauth:token-type:access_token" \
  -d "scope=calendar:write email:send" \
  -d "jit_task_id=jit_task_abc123"
```

            
        
    

    
    

    
        ## Python Integration

        
Here's a complete Python class for managing JIT permission flows in your AI agent.

        > [!NOTE]
> **Polling Best Practices**

    
        
            Python JIT Flow
            
                
                    python
                    
                
                
```
import requests
import time

class JITPermissions:
    def request_elevated_access(self, description, scopes):
        # Step 1: Create task
        task = requests.post(
            f"{self.base_url}/jit/task",
            headers=self.headers,
            json={
                "task_description": description,
                "required_scopes": scopes
            }
        ).json()
        
        # Step 2: Poll for approval
        while True:
            status = requests.get(
                f"{self.base_url}/jit/status/{task['task_id']}",
                headers=self.headers
            ).json()
            
            if status["status"] == "approved":
                break
            elif status["status"] in ["denied", "expired"]:
                raise Exception(f"JIT request {status['status']}")
            
            time.sleep(5)  # Poll every 5 seconds
        
        # Step 3: Exchange for elevated token
        tokens = requests.post(
            f"{self.base_url}/oauth/token",
            data={
                "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
                "subject_token": self.current_token,
                "subject_token_type": "urn:ietf:params:oauth:token-type:access_token",
                "scope": " ".join(scopes),
                "jit_task_id": task["task_id"]
            }
        ).json()
        
        return tokens["access_token"]
```
