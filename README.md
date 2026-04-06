# BA Agents MCP Admin Guide

This README is for admins who manage the BA Agents MCP deployment, access, and tokens.

## Public user docs

- User-facing docs live at `/docs`
- Public metadata lives at `/server.json`

## Admin responsibilities

- Configure Auth0 for admin login
- Configure Supabase for admin data storage
- Add admin users
- Add MCP OAuth clients when needed
- Create and revoke personal access tokens (PATs) for end users

## Required environment variables

```env
AUTH_SECRET=
NEXTAUTH_URL=
APP_BASE_URL=

AUTH_OIDC_ISSUER=
AUTH_OIDC_CLIENT_ID=
AUTH_OIDC_CLIENT_SECRET=
AUTH_OIDC_AUDIENCE=
MCP_RESOURCE_AUDIENCE=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

ADMIN_BOOTSTRAP_EMAILS=
```

## Database setup

Run these SQL files in Supabase:

1. [drizzle/0000_initial.sql](/Users/bssgroup/Code/BA-agents/drizzle/0000_initial.sql)
2. [drizzle/0001_personal_access_tokens.sql](/Users/bssgroup/Code/BA-agents/drizzle/0001_personal_access_tokens.sql)

Expected tables:

- `admin_users`
- `mcp_clients`
- `auth_audit_logs`
- `personal_access_tokens`

## Auth0 setup

Use your production domain in Auth0:

- Allowed Callback URLs:
  - `https://ba-agents.vercel.app/api/auth/callback/oidc`
- Allowed Logout URLs:
  - `https://ba-agents.vercel.app`
- Allowed Web Origins:
  - `https://ba-agents.vercel.app`

Add local URLs too if you use local development.

## Admin login

The first admin can be bootstrapped through:

```env
ADMIN_BOOTSTRAP_EMAILS=you@company.com
```

That email must match the email returned by Auth0.

## Admin page usage

### Admin users

- Add team members who can access `/admin`
- `owner` can manage admin users
- `admin` can manage operational data but not owner-only actions

### MCP clients

Use this only when you want OAuth client-based MCP access.

- Add the Auth0 `Client ID`
- Set `status = active`
- Set `allowedScope = mcp:read`

### Personal access tokens

Use this for the easiest end-user setup.

- Create one PAT per user
- Copy the token once and send it securely
- Revoke or disable the token if needed
- End users can use:

```text
Authorization: Bearer bss_pat_xxx
```

## End-user onboarding

For normal users, send them:

- MCP URL: `https://ba-agents.vercel.app/mcp`
- A PAT token
- The public docs URL: `https://ba-agents.vercel.app/docs`

## Deployment checklist

1. Set env vars in Vercel
2. Run Supabase SQL migrations
3. Redeploy Vercel
4. Login to `/admin`
5. Create PATs for users
6. Test MCP with one real token
