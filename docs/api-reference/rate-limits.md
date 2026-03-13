# Rate Limits

        
The LumoAuth API implements rate limiting to ensure fair usage and protect the service from abuse.
            Rate limits are applied per access token, per endpoint category.

    
    
        
            Response Headers
            
                
                    headers
                    
                
                
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 998
X-RateLimit-Reset: 1706799060
```

            
        
    

    
    

    
        
            ## Rate Limit Tiers

            
            
| Endpoint Category | Rate Limit | Window |
| --- | --- | --- |
| Admin API (read) | 1,000 requests | per minute |
| Admin API (write) | 100 requests | per minute |
| OAuth Token Endpoint | 30 requests | per minute |
| ABAC Authorization Check | 10,000 requests | per minute |
| Audit Log Export | 10 requests | per hour |

            
            
Contact us if you need higher limits for your use case.

        
    
    
    

    
    

    
        
            ## Rate Limit Headers

            
Every API response includes headers to help you track your rate limit status:

            
            
                
                    
                        X-RateLimit-Limit
                        integer
                    
                    Maximum number of requests allowed in the current window
                
                
                    
                        X-RateLimit-Remaining
                        integer
                    
                    Number of requests remaining in the current window
                
                
                    
                        X-RateLimit-Reset
                        integer
                    
                    Unix timestamp when the rate limit window resets
                
            
        
    
    
        
            429 Response
            
                
                    json
                    
                
                
```
{
  "error": true,
  "message": "Rate limit exceeded. Retry after 30 seconds.",
  "status": 429,
  "code": "rate_limit_exceeded"
}

# Headers:
# Retry-After: 30
# X-RateLimit-Limit: 100
# X-RateLimit-Remaining: 0
# X-RateLimit-Reset: 1706799060
```

            
        
    

    
    

    
        
            ## Handling Rate Limits

            
When you exceed the rate limit, the API returns a `429 Too Many Requests` response.
                The response includes a `Retry-After` header indicating when you can retry.

            
            > [!TIP]
> **Best Practice: Implement Exponential Backoff**

    
        
            Handling Rate Limits (Python)
            
                
                    python
                    
                
                
```
import requests
import time

def api_request(url, headers, max_retries=3):
    retries = 0
    
    while retries # Check rate limit status
        remaining = response.headers.get("X-RateLimit-Remaining")
        if remaining:
            print(f"Requests remaining: {remaining}")
        
        if response.status_code == 429:
            # Rate limited - wait and retry
            retry_after = int(
                response.headers.get("Retry-After", 60)
            )
            print(f"Rate limited. Waiting {retry_after}s...")
            time.sleep(retry_after)
            retries += 1
            continue
        
        return response
    
    raise Exception("Max retries exceeded")

# Usage
response = api_request(
    "https://app.lumoauth.dev/t/acme-corp/api/v1/admin/users",
    {"Authorization": "Bearer token..."}
)
```

            
        
    

    
    

    
        
            ## Concurrent Request Limits

            
In addition to rate limits, the API limits the number of concurrent requests:

            
            
| Tier | Max Concurrent Requests |
| --- | --- |
| Free | 5 |
| Pro | 25 |
| Enterprise | 100 |
