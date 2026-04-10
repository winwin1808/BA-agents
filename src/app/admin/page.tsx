import { AdminDashboardShell } from "@/components/admin/admin-dashboard-shell";
import { getOpenAiKeyMetadata } from "@/lib/ai/openai-provider";
import { requireAdminPageSession } from "@/lib/auth/admin";
import { isDatabaseConfigured } from "@/lib/db";
import {
  listAdminUsers,
  listAuditLogs,
  listMcpClients,
  listPersonalAccessTokens,
} from "@/lib/db/queries";
import { hasAdminSecretsEncryptionKey } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { adminUser } = await requireAdminPageSession("/admin");
  const [adminUsers, mcpClients, personalAccessTokens, auditLogs, openAiKey] = await Promise.all([
    listAdminUsers(),
    listMcpClients(),
    listPersonalAccessTokens(),
    listAuditLogs({ limit: 100 }),
    isDatabaseConfigured() ? getOpenAiKeyMetadata() : Promise.resolve({
      configured: false,
      status: "unconfigured" as const,
      label: null,
      modelName: null,
      maskedPreview: null,
      validationError: null,
      lastValidatedAt: null,
      updatedAt: null,
    }),
  ]);

  return (
    <main className="py-8 md:py-12">
      <section className="mb-8">
        <div className="eyebrow">Admin</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
          Access control and auth audit
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-neutral-700">
          Manage admin users, allowlisted MCP clients, and auth activity from one
          lightweight dashboard.
        </p>
      </section>

      <AdminDashboardShell
        currentRole={adminUser.role}
        dbConfigured={isDatabaseConfigured()}
        adminUsers={adminUsers.map((user) => ({
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          status: user.status,
          lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        }))}
        mcpClients={mcpClients.map((client) => ({
          id: client.id,
          oidcClientId: client.oidcClientId,
          displayName: client.displayName,
          status: client.status,
          allowedScope: client.allowedScope,
          notes: client.notes,
        }))}
        personalAccessTokens={personalAccessTokens.map((token) => ({
          id: token.id,
          label: token.label,
          ownerEmail: token.ownerEmail,
          tokenValue: token.tokenValue,
          tokenPrefix: token.tokenPrefix,
          status: token.status,
          allowedScope: token.allowedScope,
          notes: token.notes,
          lastUsedAt: token.lastUsedAt?.toISOString() ?? null,
          expiresAt: token.expiresAt?.toISOString() ?? null,
        }))}
        auditLogs={auditLogs.map((log) => ({
          id: log.id,
          eventType: log.eventType,
          email: log.email,
          clientId: log.clientId,
          route: log.route,
          outcome: log.outcome,
          reason: log.reason,
          createdAt: log.createdAt.toISOString(),
        }))}
        openAiKey={openAiKey}
        secretsConfigured={hasAdminSecretsEncryptionKey()}
      />
    </main>
  );
}
