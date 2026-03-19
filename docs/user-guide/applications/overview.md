# Applications

Applications in LumoAuth represent the OAuth 2.0 / OIDC clients that authenticate users and access protected resources. Every app, API, or service that needs to authenticate users or request tokens must be registered as an application.

---

## Application Types

| Type | Description | Example |
|------|-------------|---------|
| **Web Application** | Server-side app with a backend | Node.js, PHP, Python web app |
| **Single-Page Application (SPA)** | Client-side JavaScript app | React, Angular, Vue app |
| **Native / Mobile** | Desktop or mobile application | iOS, Android, Electron app |
| **Machine-to-Machine (M2M)** | Service-to-service communication | Backend APIs, cron jobs, microservices |
| **Device** | Input-constrained device | CLI tools, smart TVs, IoT |

---

## Managing Applications

### Portal

Navigate to `/t/{tenantSlug}/portal/applications`:

- **Create Application** - Register a new OAuth client
- **Application List** - View all registered applications
- **Application Detail** - View/edit settings, credentials, and configuration

### Creating an Application

1. Go to `/t/{tenantSlug}/portal/applications`
2. Click **Create Application**
3. Configure:

| Field | Description |
|-------|-------------|
| **Name** | Display name for the application |
| **Type** | Web, SPA, Native, M2M, or Device |
| **Redirect URIs** | Allowed callback URLs after authentication |
| **Allowed Grant Types** | Authorization Code, Client Credentials, Device Code, etc. |
| **Allowed Scopes** | Which scopes this application can request |
| **Token Lifetimes** | Custom access/refresh token durations |

4. After creation, you'll receive:
   - **Client ID** - Public identifier for the application
   - **Client Secret** - Secret key (for confidential clients only)

---

## Client Confidentiality

| Client Type | Has Secret | Use Case |
|-------------|-----------|----------|
| **Confidential** | Yes | Web apps with a backend that can securely store the secret |
| **Public** | No | SPAs, mobile apps, CLI tools that cannot securely store secrets |

Public clients must use **PKCE** (Proof Key for Code Exchange) with the Authorization Code flow.

---

## In This Section

| Guide | Description |
|-------|-------------|
| [OAuth 2.0 & OIDC](oauth2-oidc.md) | Grant types, token flows, and OIDC integration |
| [SAML Applications](saml.md) | Register SAML Service Providers |
| [Signing Keys](signing-keys.md) | JWT signing key management and rotation |
