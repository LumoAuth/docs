# Permission Checks

Check whether the authenticated user has specific permissions. These endpoints support 
    single checks, bulk checks, and logical combinations (any/all).

## Single Permission Check

    
        **POST** 
        `/api/v1/authz/check`
    

Check if the authenticated user has a specific permission. Optionally include context 
    attributes for ABAC-style checks.

### Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `permission` | string | Yes | Permission slug (e.g., `document.edit`) |
| `context` | object | No | Contextual attributes for ABAC evaluation |

### Example: Simple Check

```bash
curl -X POST https://api.example.com/api/v1/authz/check \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permission": "document.edit"
  }'
```

```json
{
  "allowed": true,
  "permission": "document.edit",
  "user_id": 123
}
```

### Example: Check with Context (ABAC)

Include context attributes to enable dynamic authorization based on resource ownership, 
    environment, or other factors.

```bash
curl -X POST https://api.example.com/api/v1/authz/check \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permission": "document.edit",
    "context": {
      "document_id": 456,
      "document_owner_id": 123,
      "department": "engineering"
    }
  }'
```

:::tip[Context Use Cases]
Context allows you to pass dynamic attributes like IP address, device type,
or request timestamp alongside permission checks for fine-grained ABAC decisions.
:::


## Bulk Permission Check

    
        **POST** 
        `/api/v1/authz/check-bulk`
    

Check multiple permissions in a single request. Returns individual results for each permission. 
    Great for loading a UI and determining which buttons/actions to show.

### Request Body

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `permissions` | array | Yes | Array of permission slugs to check |
| `context` | object | No | Shared context for all checks |

### Example

```bash
curl -X POST https://api.example.com/api/v1/authz/check-bulk \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["document.view", "document.edit", "document.delete", "document.share"],
    "context": {
      "document_id": 456
    }
  }'
```

```json
{
  "results": {
    "document.view": true,
    "document.edit": true,
    "document.delete": false,
    "document.share": true
  },
  "user_id": 123,
  "context": {
    "document_id": 456
  }
}
```

## Check Any Permission

    
        **POST** 
        `/api/v1/authz/check-any`
    

Check if the user has **at least one** of the specified permissions (OR logic). 
    Useful when multiple permissions can grant the same access.

### Example: Editor OR Owner can access settings

```bash
curl -X POST https://api.example.com/api/v1/authz/check-any \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["document.owner", "document.editor", "admin.all"]
  }'
```

```json
{
  "allowed": true,
  "permissions": ["document.owner", "document.editor", "admin.all"],
  "user_id": 123
}
```

## Check All Permissions

    
        **POST** 
        `/api/v1/authz/check-all`
    

Check if the user has **all** of the specified permissions (AND logic). 
    Use for operations that require multiple permissions.

### Example: Publishing requires both edit AND publish permissions

```bash
curl -X POST https://api.example.com/api/v1/authz/check-all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": ["document.edit", "document.publish"]
  }'
```

```json
{
  "allowed": false,
  "permissions": ["document.edit", "document.publish"],
  "user_id": 123
}
```

## Response Fields

| Field | Type | Description |
| --- | --- | --- |
| `allowed` | boolean | Whether the permission check passed |
| `permission` | string | The permission that was checked (single check) |
| `permissions` | array | The permissions that were checked (any/all) |
| `results` | object | Map of permission → result (bulk check) |
| `user_id` | integer | ID of the authenticated user |
| `context` | object | The context that was provided |

## Common Patterns

### Pattern 1: UI Button Visibility

```javascript
// Fetch permissions when loading a document editor
async function loadDocumentPermissions(documentId) {
  const response = await fetch('/api/v1/authz/check-bulk', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      permissions: ['document.edit', 'document.delete', 'document.share'],
      context: { document_id: documentId }
    })
  });
  
  const { results } = await response.json();
  
  // Show/hide UI elements based on permissions
  document.getElementById('edit-btn').hidden = !results['document.edit'];
  document.getElementById('delete-btn').hidden = !results['document.delete'];
  document.getElementById('share-btn').hidden = !results['document.share'];
}
```

### Pattern 2: API Gateway Check

```python
# Check permission before processing request
def require_permission(permission):
    def decorator(func):
        def wrapper(*args, **kwargs):
            response = requests.post(
                f'{LUMOAUTH_URL}/api/v1/authz/check',
                headers={'Authorization': f'Bearer {get_token()}'},
                json={'permission': permission}
            )
            
            if not response.json().get('allowed'):
                raise PermissionDenied(f'Missing permission: {permission}')
            
            return func(*args, **kwargs)
        return wrapper
    return decorator

@require_permission('document.delete')
def delete_document(document_id):
    # User has permission, proceed with deletion
    ...
```
