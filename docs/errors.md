# Error Codes Reference

LumoAuth returns consistent error responses across all API endpoints. 
    This reference helps you handle errors and troubleshoot issues.

## Error Response Format

All error responses follow this structure:

```json
{
  "error": "error_code",
  "error_description": "Human-readable description of the error",
  "error_uri": "https://docs.lumoauth.com/errors/error_code"
}
```

## OAuth 2.0 Errors

Standard OAuth 2.0 error codes returned by the authorization and token endpoints.

| Error Code | HTTP Status | Description | Common Causes |
| --- | --- | --- | --- |
| `invalid_request` | 400 | The request is malformed or missing required parameters | Missing grant_type, invalid JSON body, unsupported content type |
| `invalid_client` | 401 | Client authentication failed | Wrong client_id, wrong client_secret, client not found in tenant |
| `invalid_grant` | 400 | The authorization code or refresh token is invalid | Code expired, code already used, refresh token revoked |
| `unauthorized_client` | 401 | Client is not authorized to use this grant type | Trying to use client_credentials when not enabled |
| `unsupported_grant_type` | 400 | The grant type is not supported | Typo in grant_type, using deprecated grant |
| `invalid_scope` | 400 | The requested scope is invalid or not allowed | Scope not registered, exceeds client's allowed scopes |
| `access_denied` | 403 | The user or authorization server denied the request | User clicked "Deny", consent required but not granted |
| `server_error` | 500 | Unexpected server error | Internal server error, database unavailable |
| `temporarily_unavailable` | 503 | Server is temporarily unavailable | Maintenance mode, rate limiting, overload |

## Authorization API Errors

Error codes specific to the permission check endpoints.

| Error Code | HTTP Status | Description |
| --- | --- | --- |
| `MISSING_PERMISSION` | 400 | Required field 'permission' is missing from request |
| `INVALID_PERMISSIONS` | 400 | Permissions field must be a non-empty array |
| `MISSING_FIELDS` | 400 | Required fields are missing (Zanzibar check: object, relation, user) |
| `CHECK_FAILED` | 500 | Permission check failed due to server error |
| `ZANZIBAR_CHECK_FAILED` | 400 | Zanzibar relationship check failed (invalid format or unknown namespace) |
| `LIST_FAILED` | 500 | Failed to retrieve user permissions |

## Token Introspection Errors

| Error Code | HTTP Status | Description |
| --- | --- | --- |
| `invalid_token` | 401 | The token provided is expired, revoked, or malformed |
| `insufficient_scope` | 403 | The token doesn't have the required scope for this operation |

## Agent & Token Exchange Errors

| Error Code | HTTP Status | Description |
| --- | --- | --- |
| `invalid_target` | 400 | Token exchange target (audience) is invalid |
| `unsupported_token_type` | 400 | The subject_token_type or actor_token_type is not supported |
| `delegation_not_allowed` | 403 | Client is not configured to allow token exchange/delegation |
| `budget_exceeded` | 429 | Agent has exceeded its configured budget limits |
| `capability_denied` | 403 | Agent lacks the required capability for this operation |
| `workload_identity_failed` | 401 | Failed to verify workload identity token |

## Dynamic Client Registration Errors

| Error Code | HTTP Status | Description |
| --- | --- | --- |
| `invalid_redirect_uri` | 400 | One or more redirect URIs are invalid or use a non-allowed scheme |
| `registration_not_allowed` | 403 | Dynamic client registration is disabled for this tenant |
| `invalid_client_metadata` | 400 | Client metadata is invalid or contains unsupported values |

## HTTP Status Code Summary

| Status | Meaning | Action |
| --- | --- | --- |
| **200** | Success | Request completed successfully |
| **400** | Bad Request | Fix the request parameters or body |
| **401** | Unauthorized | Check credentials, refresh token, or re-authenticate |
| **403** | Forbidden | User/client lacks permission for this action |
| **404** | Not Found | Check the endpoint URL and tenant slug |
| **429** | Too Many Requests | Back off and retry after the specified time |
| **500** | Server Error | Retry with exponential backoff; contact support if persistent |
| **503** | Service Unavailable | Retry later; check status page |

## Error Handling Best Practices

```python
import requests
import time

class LumoAuthClient:
    MAX_RETRIES = 3
    
    def call_api(self, method, url, **kwargs):
        for attempt in range(self.MAX_RETRIES):
            response = requests.request(method, url, **kwargs)
            
            if response.status_code == 200:
                return response.json()
            
            # Handle specific errors
            if response.status_code == 401:
                # Token expired - refresh and retry
                self.refresh_token()
                continue
            
            if response.status_code == 429:
                # Rate limited - back off
                retry_after = int(response.headers.get('Retry-After', 60))
                time.sleep(retry_after)
                continue
            
            if response.status_code >= 500:
                # Server error - exponential backoff
                time.sleep(2 ** attempt)
                continue
            
            # Client error - don't retry
            error = response.json()
            raise LumoAuthError(
                code=error.get('error'),
                message=error.get('error_description')
            )
        
        raise LumoAuthError(code='max_retries', message='Max retries exceeded')
```
