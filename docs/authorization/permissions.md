# List Permissions

Retrieve all permissions granted to the authenticated user. Useful for building dynamic UIs, 
    auditing access, and debugging authorization issues.

    
        **GET** 
        `/api/v1/authz/permissions`
    

## When to Use This

- **Build dynamic UIs:** Show/hide features based on all available permissions
- **User profile pages:** Display what the user can do
- **Audit and compliance:** Log what permissions a user has
- **Debugging:** Understand why a user can or can't access something

## Request

Simply include the access token. No request body needed.

```bash
curl -X GET https://api.example.com/api/v1/authz/permissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Response

```json
{
  "user_id": 123,
  "permissions": [
    {
      "slug": "document.view",
      "description": "View documents",
      "source": "role:Viewer"
    },
    {
      "slug": "document.edit",
      "description": "Edit documents",
      "source": "role:Editor"
    },
    {
      "slug": "document.create",
      "description": "Create new documents",
      "source": "role:Editor"
    },
    {
      "slug": "user.view",
      "description": "View user profiles",
      "source": "role:Admin"
    },
    {
      "slug": "user.manage",
      "description": "Manage users",
      "source": "role:Admin"
    }
  ],
  "count": 5
}
```

## Response Fields

| Field | Type | Description |
| --- | --- | --- |
| `user_id` | integer | ID of the authenticated user |
| `permissions` | array | Array of permission objects |
| `count` | integer | Total number of permissions |

### Permission Object

| Field | Type | Description |
| --- | --- | --- |
| `slug` | string | Unique permission identifier (e.g., `document.edit`) |
| `description` | string | Human-readable description |
| `source` | string | Where this permission comes from (e.g., `role:Admin`) |

:::note[Understanding Permission Sources]
Permissions can come from direct role assignments, group membership, or
inherited through the role hierarchy. The list endpoint shows all effective permissions.
:::


## Usage Examples

### Building a Navigation Menu

```javascript
async function buildNavigation() {
  const response = await fetch('/api/v1/authz/permissions', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  const { permissions } = await response.json();
  const permSet = new Set(permissions.map(p => p.slug));
  
  const navItems = [];
  
  // Always show dashboard
  navItems.push({ label: 'Dashboard', href: '/dashboard' });
  
  // Conditionally show based on permissions
  if (permSet.has('document.view')) {
    navItems.push({ label: 'Documents', href: '/documents' });
  }
  
  if (permSet.has('user.view') || permSet.has('user.manage')) {
    navItems.push({ label: 'Users', href: '/users' });
  }
  
  if (permSet.has('settings.manage')) {
    navItems.push({ label: 'Settings', href: '/settings' });
  }
  
  return navItems;
}
```

### Creating a Permission Check Utility

```python
class PermissionCache:
    """Cache user permissions for efficient checking"""
    
    def __init__(self, access_token):
        self.token = access_token
        self._permissions = None
    
    def load(self):
        """Fetch and cache all permissions"""
        response = requests.get(
            f'{LUMOAUTH_URL}/api/v1/authz/permissions',
            headers={'Authorization': f'Bearer {self.token}'}
        )
        data = response.json()
        self._permissions = {p['slug'] for p in data['permissions']}
        return self._permissions
    
    def has(self, permission):
        """Check if user has a permission"""
        if self._permissions is None:
            self.load()
        return permission in self._permissions
    
    def has_any(self, permissions):
        """Check if user has any of the permissions"""
        if self._permissions is None:
            self.load()
        return bool(self._permissions & set(permissions))

# Usage
perms = PermissionCache(access_token)
if perms.has('document.delete'):
    delete_document(doc_id)
```

:::tip[Performance Tip]
For high-throughput applications, batch multiple permission checks into a single
request using the batch check endpoint to reduce network overhead.
:::

