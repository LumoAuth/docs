# GDPR Compliance

LumoAuth provides built-in tools to help you meet GDPR (General Data Protection Regulation) requirements for user data handling, consent, data access, and data deletion.

---

## GDPR Features

| Feature | Description | Portal Location |
|---------|-------------|----------------|
| **Data Subject Access Requests (DSAR)** | Export all data for a user | `/t/{tenantSlug}/portal/gdpr` |
| **Right to Erasure** | Delete all user data on request | `/t/{tenantSlug}/portal/gdpr` |
| **Consent Management** | Track user consent for data processing | Auth settings |
| **Data Minimization** | Collect only necessary user data | Profile configuration |
| **Audit Trail** | Full log of data access and changes | `/t/{tenantSlug}/portal/audit-logs` |

---

## Data Subject Access Requests (DSAR)

When a user requests access to their data (Article 15), LumoAuth can generate a complete data export.

### Processing a DSAR

1. Go to `/t/{tenantSlug}/portal/gdpr`
2. Click **New Data Subject Request**
3. Select **Data Access Request**
4. Search for the user by email
5. Click **Generate Export**

The export includes:
- User profile information
- Login history and session data
- Role and group assignments
- MFA enrollment status
- Social account links
- Consent records
- Audit log entries related to the user

### Via API

```bash
curl -X POST https://your-domain.com/t/{tenantSlug}/api/v1/gdpr/data-export \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-uuid"}'
```

---

## Right to Erasure (Right to Be Forgotten)

When a user requests deletion of their data (Article 17):

### Processing a Deletion Request

1. Go to `/t/{tenantSlug}/portal/gdpr`
2. Click **New Data Subject Request**
3. Select **Data Deletion Request**
4. Search for the user by email
5. Review what will be deleted
6. Click **Process Deletion**

### What Gets Deleted

| Data Category | Action |
|--------------|--------|
| User profile | Deleted |
| Login sessions | Revoked and deleted |
| Access/refresh tokens | Revoked |
| MFA methods | Deleted |
| Passkey credentials | Deleted |
| Social account links | Deleted |
| Group memberships | Removed |
| Role assignments | Removed |

### What Gets Retained

Some data is retained for legitimate business purposes (Article 17(3)):

| Data | Reason | Retention |
|------|--------|-----------|
| Audit log entries | Security and compliance | Anonymized (user ID replaced) |
| GDPR request records | Compliance proof | Retained with request metadata |

---

## Consent Management

Track and manage user consent for data processing:

| Consent Type | Description |
|-------------|-------------|
| **Terms of Service** | Agreement to service terms |
| **Privacy Policy** | Acknowledgment of data practices |
| **Marketing** | Opt-in for marketing communications |
| **Analytics** | Consent for usage analytics |

Consent records include:
- What was consented to
- When consent was given
- How consent was obtained (login, registration, explicit prompt)
- Consent withdrawal timestamp (if applicable)

---

## Data Processing Records

LumoAuth maintains records of processing activities (Article 30) including:

- What personal data is collected
- Purpose of processing
- Categories of data subjects
- Data retention periods
- Technical and organizational security measures

---

## User Self-Service

Users can exercise their GDPR rights through self-service:

| Right | Self-Service Action |
|-------|-------------------|
| **Access** | Download their data from account settings |
| **Rectification** | Update profile information |
| **Erasure** | Request account deletion |
| **Portability** | Export data in machine-readable format |

---

## Related Guides

- [Audit Logs](audit-logs.md) - Track all data access and changes
- [User Management](../user-management/overview.md) - Manage user data
- [Account Self-Service](../user-management/account-self-service.md) - User-initiated GDPR actions
