import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { requireAdminPageSession } from "@/lib/auth/admin";
import { isDatabaseConfigured } from "@/lib/db";
import { listAdminUsers, listAuditLogs, listMcpClients } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { adminUser } = await requireAdminPageSession("/admin");
  const [adminUsers, mcpClients, auditLogs] = await Promise.all([
    listAdminUsers(),
    listMcpClients(),
    listAuditLogs({ limit: 100 }),
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

      <AdminDashboard
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
      />
    </main>
  );
}
