# Enterprise SSO

Connect LumoAuth to enterprise identity providers using SAML 2.0, OpenID Connect (OIDC), or LDAP/Active Directory. This enables single sign-on (SSO) so employees can log in with their corporate credentials.

---

## Supported Protocols

| Protocol | Use Case | LumoAuth Role |
|----------|----------|--------------|
| **SAML 2.0** | Enterprise SSO with Okta, Azure AD, PingFederate, etc. | Service Provider (SP) and Identity Provider (IdP) |
| **OpenID Connect** | Modern SSO with external OIDC providers | Relying Party (RP) |
| **LDAP / Active Directory** | Direct directory authentication | LDAP client with JIT provisioning |

---

## SAML 2.0

### LumoAuth as Service Provider (SP)

When LumoAuth acts as a SAML SP, it delegates authentication to an external SAML IdP (like Okta or Azure AD).

**Flow:**
1. User clicks "Log in with SSO" on LumoAuth login page
2. LumoAuth generates a SAML AuthnRequest and redirects to the IdP
3. User authenticates at the IdP
4. IdP sends a SAML Assertion back to LumoAuth
5. LumoAuth validates the assertion and creates/links the user account
6. User is logged in

### Configuration

Configure SAML IdP connections at:
```
/t/{tenantSlug}/portal/configuration/saml-idp
```

**Required Settings:**

| Setting | Description |
|---------|-------------|
| **IdP Entity ID** | The identity provider's entity ID |
| **IdP SSO URL** | Single Sign-On URL for SAML requests |
| **IdP SLO URL** | Single Logout URL (optional) |
| **IdP Certificate** | X.509 certificate for signature verification |
| **Name ID Format** | Format for the user identifier (email, persistent, etc.) |
| **Attribute Mapping** | Map SAML attributes to LumoAuth user profile fields |

**LumoAuth SP Metadata:**

Your SAML IdP needs LumoAuth's SP metadata, available at:
```
/t/{tenantSlug}/api/v1/saml/metadata
```

Or configure manually in your IdP:
- **SP Entity ID**: `https://your-domain.com/t/{tenantSlug}`
- **ACS URL**: `https://your-domain.com/t/{tenantSlug}/saml/acs`
- **SLO URL**: `https://your-domain.com/t/{tenantSlug}/saml/sls`

### LumoAuth as Identity Provider (IdP)

LumoAuth can also act as a SAML IdP, allowing external applications to authenticate users stored in LumoAuth.

Configure SAML SP (client) applications at:
```
/t/{tenantSlug}/portal/applications/saml
```

For each SAML client:
- **SP Entity ID** - The service provider's entity ID
- **ACS URL** - Where to send the SAML assertion
- **Name ID Format** - How to identify the user
- **Attribute Statements** - Which user attributes to include

---

## OpenID Connect (OIDC) Federation

### Connect External OIDC Providers

LumoAuth can act as an OIDC Relying Party (RP), delegating authentication to external OIDC identity providers.

Configure at:
```
/t/{tenantSlug}/portal/configuration/oidc-idp
```

**Required Settings:**

| Setting | Description |
|---------|-------------|
| **Issuer URL** | The OIDC provider's issuer (e.g., `https://accounts.google.com`) |
| **Client ID** | OAuth client ID from the external provider |
| **Client Secret** | OAuth client secret |
| **Scopes** | Scopes to request (e.g., `openid profile email`) |
| **Discovery URL** | `.well-known/openid-configuration` URL (auto-configures endpoints) |

**OIDC Discovery:** If the provider supports OIDC Discovery, LumoAuth can auto-configure by entering just the issuer URL.

---

## LDAP / Active Directory

### Direct LDAP Authentication

Connect LumoAuth directly to an LDAP or Active Directory server to authenticate users against the corporate directory.

Configure at:
```
/t/{tenantSlug}/portal/configuration/ldap
```

**Required Settings:**

| Setting | Description |
|---------|-------------|
| **Host** | LDAP server hostname or IP |
| **Port** | Connection port (389 for LDAP, 636 for LDAPS) |
| **Base DN** | Base Distinguished Name for user searches |
| **Bind DN** | DN of the service account for LDAP queries |
| **Bind Password** | Password for the service account |
| **User Filter** | LDAP filter to find users (e.g., `(sAMAccountName={username})`) |
| **Use TLS** | Enable LDAP over TLS (LDAPS) - strongly recommended |

### Attribute Mapping

Map LDAP attributes to LumoAuth user profile fields:

| LDAP Attribute | LumoAuth Field |
|---|---|
| `mail` | `email` |
| `displayName` | `name` |
| `sAMAccountName` | `username` |
| `memberOf` | `groups` |
| `telephoneNumber` | `phone` |

### JIT Provisioning from LDAP

When JIT (Just-In-Time) provisioning is enabled:

1. User attempts to log in with LDAP credentials
2. LumoAuth authenticates against the LDAP server
3. If the user doesn't exist in LumoAuth, an account is automatically created
4. User profile is populated from LDAP attributes
5. Optionally, LDAP group memberships are synced to LumoAuth roles

---

## JIT User Provisioning

Regardless of the SSO protocol, LumoAuth supports JIT provisioning:

### How It Works

When a user authenticates via an external IdP for the first time:

1. LumoAuth receives the user's identity information (email, name, etc.)
2. If no LumoAuth account exists for that user, one is automatically created
3. The user profile is populated from the IdP's assertion/claims
4. Default roles are assigned (configurable per tenant)
5. The external identity is linked to the LumoAuth account

### Configuration

JIT provisioning settings per IdP connection:

| Setting | Description |
|---------|-------------|
| **Enable JIT** | Create accounts automatically on first SSO login |
| **Default Roles** | Roles to assign to JIT-provisioned users |
| **Attribute Mapping** | Map IdP fields to LumoAuth user profile |
| **Update on Login** | Sync user profile on every login (not just first) |

---

## Single Logout

LumoAuth supports single logout flows:

- **SAML SLO** - When a user logs out of LumoAuth, the SAML logout request is sent to the IdP
- **OIDC Logout** - Front-channel and back-channel logout supported
- **Session Termination** - All LumoAuth sessions are invalidated

---

## Common SSO Configurations

### Okta

1. In Okta Admin → Applications → Create App Integration → SAML 2.0
2. Set **SSO URL** to: `https://your-domain.com/t/{tenantSlug}/saml/acs`
3. Set **Audience URI** to: `https://your-domain.com/t/{tenantSlug}`
4. Configure attribute statements (email, firstName, lastName)
5. Download the IdP metadata and import into LumoAuth

### Azure AD

1. In Azure Portal → Enterprise Applications → Create New
2. Set up SAML SSO configuration
3. Set **Reply URL** to: `https://your-domain.com/t/{tenantSlug}/saml/acs`
4. Set **Identifier** to: `https://your-domain.com/t/{tenantSlug}`
5. Download the Federation Metadata XML and import into LumoAuth

### Google Workspace

1. In Google Admin → Security → SSO with third-party IdP
2. Or use OIDC: Configure LumoAuth as an OIDC RP with Google's issuer URL

---

## Related Guides

- [Authentication Overview](overview.md) - All authentication methods
- [Social Login](social-login.md) - OAuth-based social identity providers
- [SAML Applications](../applications/saml.md) - Configure SAML SP applications
- [SCIM Provisioning](../integrations/scim.md) - Automated user provisioning from IdPs
