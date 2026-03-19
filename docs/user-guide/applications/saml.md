# SAML Applications

LumoAuth supports SAML 2.0 as both an Identity Provider (IdP) and can integrate with external SAML Identity Providers. This guide covers registering SAML Service Providers (SPs) to use LumoAuth as their identity source.

---

## LumoAuth as SAML Identity Provider

When LumoAuth acts as the IdP, your applications (Service Providers) redirect users to LumoAuth for authentication, and LumoAuth sends back a SAML assertion confirming the user's identity.

```
User → Service Provider → LumoAuth (IdP) → Authenticates → SAML Assertion → Service Provider
```

---

## Registering a SAML Service Provider

### Via Portal

1. Go to `/t/{tenantSlug}/portal/configuration/saml-idp`
2. Click **Add Service Provider**
3. Configure:

| Field | Description | Example |
|-------|-------------|---------|
| **Name** | Display name | `Salesforce` |
| **Entity ID** | SP's unique SAML identifier | `https://salesforce.com/sp` |
| **ACS URL** | Assertion Consumer Service URL | `https://login.salesforce.com/saml/acs` |
| **SLO URL** | Single Logout URL (optional) | `https://login.salesforce.com/saml/slo` |
| **Name ID Format** | User identifier format | `emailAddress`, `persistent`, `transient` |
| **Signing Certificate** | SP's certificate for request verification | Upload `.crt` file |

### LumoAuth IdP Metadata

Provide this metadata URL to your Service Provider:

```
/t/{tenantSlug}/api/v1/saml/idp/metadata
```

The metadata includes:
- IdP Entity ID
- SSO endpoint URL
- SLO endpoint URL
- Signing certificate

---

## SAML Endpoints

| Endpoint | URL | Purpose |
|----------|-----|---------|
| **SSO (HTTP-POST)** | `/t/{tenantSlug}/api/v1/saml/idp/sso` | Receive authentication requests |
| **SSO (HTTP-Redirect)** | `/t/{tenantSlug}/api/v1/saml/idp/sso` | Receive authentication requests |
| **SLO** | `/t/{tenantSlug}/api/v1/saml/idp/slo` | Single logout |
| **Metadata** | `/t/{tenantSlug}/api/v1/saml/idp/metadata` | IdP metadata XML |

---

## Attribute Mapping

Configure which user attributes are included in the SAML assertion:

| SAML Attribute | LumoAuth Field | Example Value |
|---------------|----------------|---------------|
| `email` | User email | `alice@acme.com` |
| `firstName` | First name | `Alice` |
| `lastName` | Last name | `Smith` |
| `groups` | Group memberships | `engineering, admins` |
| `roles` | Role assignments | `editor, auditor` |

Custom attribute mappings can be configured per Service Provider to match what each SP expects.

---

## SAML Assertion Example

```xml
<saml:Assertion>
  <saml:Issuer>https://your-domain.com/t/acme-corp</saml:Issuer>
  <saml:Subject>
    <saml:NameID Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress">
      alice@acme.com
    </saml:NameID>
  </saml:Subject>
  <saml:Conditions>
    <saml:AudienceRestriction>
      <saml:Audience>https://salesforce.com/sp</saml:Audience>
    </saml:AudienceRestriction>
  </saml:Conditions>
  <saml:AttributeStatement>
    <saml:Attribute Name="email">
      <saml:AttributeValue>alice@acme.com</saml:AttributeValue>
    </saml:Attribute>
    <saml:Attribute Name="firstName">
      <saml:AttributeValue>Alice</saml:AttributeValue>
    </saml:Attribute>
  </saml:AttributeStatement>
</saml:Assertion>
```

---

## Common SP Configurations

### Salesforce

| Setting | Value |
|---------|-------|
| Entity ID | `https://your-company.my.salesforce.com` |
| ACS URL | `https://your-company.my.salesforce.com?so=ORGID` |
| Name ID | `emailAddress` |

### AWS

| Setting | Value |
|---------|-------|
| Entity ID | `urn:amazon:webservices` |
| ACS URL | `https://signin.aws.amazon.com/saml` |
| Name ID | `persistent` |

### Tableau

| Setting | Value |
|---------|-------|
| Entity ID | `https://sso.online.tableau.com/public/sp/metadata` |
| ACS URL | Your Tableau Online SSO URL |
| Name ID | `emailAddress` |

---

## Related Guides

- [Enterprise SSO](../authentication/enterprise-sso.md) - Using external SAML/OIDC IdPs
- [Applications Overview](overview.md) - Register and manage applications
- [OAuth 2.0 & OIDC](oauth2-oidc.md) - OAuth/OIDC-based applications
