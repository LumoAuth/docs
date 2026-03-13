# Errors

        
LumoAuth uses conventional HTTP response codes to indicate the success or failure of an API request.
            Codes in the 2xx range indicate success. Codes in the 4xx range indicate an error with the information
            provided. Codes in the 5xx range indicate an error with LumoAuth's servers.

    
    
        
            Validation Error (400)
            
                
                    json
                    
                
                
```
{
  "error": true,
  "message": "Validation failed",
  "status": 400,
  "code": "validation_error",
  "details": {
    "email": "Invalid email format",
    "password": "Must be at least 8 characters"
  }
}
```

            
        
    

    
    

    
        ## HTTP Status Codes

        
        
| Code | Description |
| --- | --- |
| `200` OK | Request succeeded. Response includes the requested data. |
| `201` Created | Resource was successfully created. |
| `204` No Content | Request succeeded. No content to return (common for DELETE). |
| `400` Bad Request | The request was malformed or contains invalid parameters. |
| `401` Unauthorized | No valid access token was provided. |
| `403` Forbidden | The access token doesn't have permissions for this request. |
| `404` Not Found | The requested resource doesn't exist. |
| `409` Conflict | The request conflicts with existing data (e.g., duplicate email). |
| `422` Unprocessable Entity | The request was valid but the data failed validation. |
| `429` Too Many Requests | Rate limit exceeded. See [Rate Limits](/api-reference/rate-limits). |
| `500` Internal Server Error | Something went wrong on our end. Contact support if persistent. |

    
    
        
            Unauthorized (401)
            
                
                    json
                    
                
                
```
{
  "error": true,
  "message": "Invalid or expired access token",
  "status": 401,
  "code": "invalid_token"
}
```

            
        

        
            Not Found (404)
            
                
                    json
                    
                
                
```
{
  "error": true,
  "message": "User not found",
  "status": 404,
  "code": "resource_not_found",
  "details": {
    "user_id": "usr_nonexistent"
  }
}
```

            
        

        
            Conflict (409)
            
                
                    json
                    
                
                
```
{
  "error": true,
  "message": "User with this email already exists",
  "status": 409,
  "code": "duplicate_resource"
}
```

            
        
    

    
    

    
        ## Error Response Format

        
All error responses follow a consistent JSON structure:

        
        
            
                
                    error
                    boolean
                
                Always `true` for error responses
            
            
                
                    message
                    string
                
                A human-readable description of the error
            
            
                
                    status
                    integer
                
                The HTTP status code
            
            
                
                    code
                    string
                    optional
                
                A machine-readable error code for programmatic handling
            
            
                
                    details
                    object
                    optional
                
                Additional context about the error (e.g., field validation errors)
            
        
    
    
        
            Rate Limited (429)
            
                
                    json
                    
                
                
```
{
  "error": true,
  "message": "Rate limit exceeded. Retry after 30 seconds.",
  "status": 429,
  "code": "rate_limit_exceeded"
}

# Response Headers:
# Retry-After: 30
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 0
```

            
        
    

    
    

    
        ## Common Error Codes

        
These machine-readable codes help you handle errors programmatically:

        
        
| Code | Description |
| --- | --- |
| `invalid_request` | The request is missing required parameters or has invalid values |
| `invalid_token` | The access token is invalid, expired, or revoked |
| `insufficient_scope` | The token lacks the required scope for this operation |
| `resource_not_found` | The requested resource doesn't exist |
| `duplicate_resource` | A resource with this identifier already exists |
| `validation_error` | One or more fields failed validation |
| `rate_limit_exceeded` | Too many requests in a short time period |
| `tenant_not_found` | The specified tenant doesn't exist |
| `permission_denied` | You don't have permission to perform this action |

    
    
        
            Error Handling Example
            
                
                    python
                    
                
                
```
import requests

try:
    response = requests.post(
        "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users",
        json={"email": "new@example.com"},
        headers={"Authorization": f"Bearer {token}"}
    )
    response.raise_for_status()
    user = response.json()
    
except requests.HTTPError as e:
    error = e.response.json()
    
    if error.get("code") == "duplicate_resource":
        print("User already exists")
    elif error.get("code") == "validation_error":
        for field, msg in error.get("details", {}).items():
            print(f"{field}: {msg}")
    else:
        print(f"Error: {error.get('message')}")
```

            
        
    

    
    

    
        ## Handling Errors

        
We recommend implementing error handling that:

        
- Checks the HTTP status code first
- Parses the `code` field for programmatic handling
- Uses the `message` field for logging or displaying to users
- Inspects `details` for field-level validation errors

        
        > [!TIP]
> **Pro Tip**
