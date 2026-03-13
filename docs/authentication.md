# Authentication

LumoAuth uses OAuth 2.0 and OpenID Connect to authenticate users and applications. 
    This guide explains the core concepts and helps you choose the right flow for your use case.

## How Authentication Works

Authentication with LumoAuth follows the industry-standard OAuth 2.0 protocol. 
    Here's a simplified view of how it works:

:::note
:::


## Choosing the Right Flow

Different applications need different authentication flows. Here's how to choose:

| Application Type | Recommended Flow | Use Client Secret? |
| --- | --- | --- |
| Server-side web app (PHP, Node, Python) | Authorization Code | Yes |
| Single-page app (React, Vue, Angular) | Authorization Code + PKCE | No |
| Mobile app (iOS, Android) | Authorization Code + PKCE | No |
| Backend service / API / Cron job | [Client Credentials](/oauth/token) | Yes |
| AI Agent | [Client Credentials or Federation](/agents) | Varies |

## Understanding Tokens

After successful authentication, LumoAuth issues several types of tokens:

### Access Token

The access token is what you use to call protected APIs. It's short-lived (typically 1 hour) 
    for security. LumoAuth can issue tokens in two formats:

| Format | Description | Best For |
| --- | --- | --- |
| **JWT** | Self-contained token with user info and claims. Can be validated locally without calling LumoAuth. | Microservices, distributed systems, performance-critical apps |
| **Opaque** | Random string that must be validated by calling the introspection endpoint. | When you need immediate revocation or don't want to expose user info |

### Refresh Token

A long-lived token used to get new access tokens without requiring the user to log in again. 
    Refresh tokens typically last 30 days but can be configured per client.

### ID Token (OIDC)

When you request the `openid` scope, you'll also receive an ID token. 
    This JWT contains user identity information (claims) like name, email, and profile picture. 
    It's meant to be read by your application, not sent to APIs.

## PKCE (Proof Key for Code Exchange)

PKCE (pronounced "pixy") is a security enhancement for OAuth that protects against 
    authorization code interception attacks. It's **required** for public clients 
    (SPAs, mobile apps) and **recommended** for all clients.

:::warning[Why Use PKCE?]
PKCE prevents authorization code interception attacks. It's required for public clients
(SPAs, mobile apps) and strongly recommended for all OAuth clients.
:::


Here's how PKCE works:

1. Your app generates a random `code_verifier` (43-128 characters)
2. Create a `code_challenge` by SHA-256 hashing the verifier and base64url encoding it
3. Send the `code_challenge` to the authorization endpoint
4. When exchanging the code, include the original `code_verifier`
5. LumoAuth verifies that the verifier matches the challenge

```javascript
// Generate PKCE values
function generatePKCE() {
  // Generate a random code verifier
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const codeVerifier = base64UrlEncode(array);
  
  // Create the code challenge
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = base64UrlEncode(new Uint8Array(hash));
  
  return { codeVerifier, codeChallenge };
}

function base64UrlEncode(buffer) {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
```

## Scopes

Scopes define what permissions your application is requesting. Common scopes include:

| Scope | Description |
| --- | --- |
| `openid` | Required for OIDC. Returns an ID token with the user's identity. |
| `profile` | Access to user's profile information (name, picture, etc.) |
| `email` | Access to user's email address |
| `offline_access` | Request a refresh token for long-lived sessions |
| Custom scopes | Application-specific permissions (e.g., `read:reports`) |

## Security Best Practices

    
- **Always use HTTPS** — All OAuth traffic must be encrypted
- **Use PKCE** — Even for server-side apps, PKCE adds defense in depth
- **Store secrets securely** — Never expose client secrets in frontend code
- **Validate state parameter** — Prevent CSRF attacks by verifying the state
- **Use short-lived tokens** — Prefer refresh token rotation over long access tokens
- **Validate redirect URIs** — Only allow exact matches, never wildcards

## Next Steps

Now that you understand the concepts, dive into the specific endpoints:

    [Authorization Endpoint
        
            Start the OAuth flow and redirect users to log in.](/oauth/authorize)
    
    [Token Endpoint
        
            Exchange codes for tokens and understand grant types.](/oauth/token)
