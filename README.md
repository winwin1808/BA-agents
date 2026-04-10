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
- Configure the Gemini settings used by public workflow generation

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
ADMIN_SECRETS_ENCRYPTION_KEY=

V0_API_KEYS=
V0_API_KEY=

ADMIN_BOOTSTRAP_EMAILS=
```

## Database setup

Run these SQL files in Supabase:

1. [drizzle/0000_initial.sql](/Users/bssgroup/Code/BA-agents/drizzle/0000_initial.sql)
2. [drizzle/0001_personal_access_tokens.sql](/Users/bssgroup/Code/BA-agents/drizzle/0001_personal_access_tokens.sql)
3. [drizzle/0002_pat_token_value.sql](/Users/bssgroup/Code/BA-agents/drizzle/0002_pat_token_value.sql)
4. [drizzle/0003_workflows_and_provider_keys.sql](/Users/bssgroup/Code/BA-agents/drizzle/0003_workflows_and_provider_keys.sql)
5. [drizzle/0004_provider_key_model_name.sql](/Users/bssgroup/Code/BA-agents/drizzle/0004_provider_key_model_name.sql)

Expected tables:

- `admin_users`
- `mcp_clients`
- `auth_audit_logs`
- `personal_access_tokens`
- `provider_api_keys`
- `workflow_artifacts`
- `workflow_generation_attempts`

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

### Gemini workflow settings

- Only `owner` users can manage the Gemini API key and model in `/admin`
- The key is stored encrypted at rest and is never shown again after save
- Public workflow generation at `/workflows` stays unavailable until a valid key is configured
- `ADMIN_SECRETS_ENCRYPTION_KEY` is only the server-side master key used to encrypt provider secrets stored from `/admin`
- `ADMIN_SECRETS_ENCRYPTION_KEY` must be set before the admin can save provider keys

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
5. Configure the Gemini workflow settings in `/admin` if you want `/workflows` generation enabled
6. Create PATs for users
7. Test MCP with one real token

## Optional v0 integration

Set `V0_API_KEYS` if you want the MCP server to generate very basic reference UI previews through the `generate_reference_ui` tool. `V0_API_KEY` is still supported as a single-key fallback.

- `V0_API_KEYS` can be comma-separated or newline-separated
- The server rotates keys round-robin per request and will try the next key when one hits auth/quota/rate-limit style failures

- The integration uses the official `v0-sdk`
- Output is intentionally constrained to low-fidelity single-page UI references
- Each tool call should include the full confirmed UX/UI task, not only a short feature label
- The tool returns the v0 chat URL, demo URL, and generated file names
