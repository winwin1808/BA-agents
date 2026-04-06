"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminUserRow = {
  id: string;
  email: string;
  displayName: string;
  role: "owner" | "admin";
  status: "active" | "disabled";
  lastLoginAt: string | null;
};

type McpClientRow = {
  id: string;
  oidcClientId: string;
  displayName: string;
  status: "active" | "disabled";
  allowedScope: string;
  notes: string | null;
};

type AuditLogRow = {
  id: string;
  eventType: string;
  email: string | null;
  clientId: string | null;
  route: string | null;
  outcome: string;
  reason: string | null;
  createdAt: string;
};

export function AdminDashboard(props: {
  currentRole: "owner" | "admin";
  adminUsers: AdminUserRow[];
  mcpClients: McpClientRow[];
  auditLogs: AuditLogRow[];
  dbConfigured: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>(props.auditLogs);
  const [auditEventType, setAuditEventType] = useState("");
  const [auditOutcome, setAuditOutcome] = useState("");
  const [isPending, startTransition] = useTransition();

  async function submitJson(path: string, method: "POST" | "PATCH", body: unknown) {
    const response = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => ({}))) as { error?: string; message?: string };
    if (!response.ok) {
      throw new Error(payload.error ?? payload.message ?? "Request failed");
    }

    return payload;
  }

  function handleFormAction(action: () => Promise<void>, options?: { refresh?: boolean }) {
    startTransition(async () => {
      try {
        setMessage(null);
        await action();
        if (options?.refresh !== false) {
          router.refresh();
        }
        setMessage("Saved.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Request failed");
      }
    });
  }

  async function refreshAuditLogs() {
    const search = new URLSearchParams();
    if (auditEventType) {
      search.set("eventType", auditEventType);
    }
    if (auditOutcome) {
      search.set("outcome", auditOutcome);
    }
    search.set("limit", "100");

    const response = await fetch(`/api/admin/audit-logs?${search.toString()}`);
    const payload = (await response.json()) as { logs: AuditLogRow[] };
    setAuditLogs(payload.logs);
  }

  return (
    <div className="space-y-6">
      {!props.dbConfigured ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Database is not configured. Set <code>POSTGRES_URL</code> before using admin APIs.
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-neutral-300 bg-white/80 px-4 py-3 text-sm">
          {message}
        </div>
      ) : null}

      <section className="panel p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Admin users</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Sign-in is limited to bootstrap emails and rows in this table.
            </p>
          </div>
          <div className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-500">
            {props.currentRole}
          </div>
        </div>

        {props.currentRole === "owner" ? (
          <form
          className="mt-5 grid gap-3 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formElement = event.currentTarget;
            const form = new FormData(event.currentTarget);
            handleFormAction(async () => {
              await submitJson("/api/admin/admin-users", "POST", {
                email: form.get("email"),
                displayName: form.get("displayName"),
                role: form.get("role"),
              });
              formElement.reset();
            });
          }}
          >
            <input className="rounded-xl border border-neutral-300 px-3 py-2" name="email" placeholder="email@company.com" required />
            <input className="rounded-xl border border-neutral-300 px-3 py-2" name="displayName" placeholder="Display name" required />
            <select className="rounded-xl border border-neutral-300 px-3 py-2" name="role" defaultValue="admin">
              <option value="admin">admin</option>
              <option value="owner">owner</option>
            </select>
            <button className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={isPending} type="submit">
              Add admin
            </button>
          </form>
        ) : null}

        <div className="mt-5 space-y-3">
          {props.adminUsers.map((user) => (
            <form
              key={user.id}
              className="grid gap-3 rounded-2xl border border-neutral-200 bg-white/80 p-4 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                handleFormAction(async () => {
                  await submitJson("/api/admin/admin-users", "PATCH", {
                    id: user.id,
                    displayName: form.get("displayName"),
                    role: form.get("role"),
                    status: form.get("status"),
                  });
                });
              }}
            >
              <div>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  Last login: {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                </p>
              </div>
              <input className="rounded-xl border border-neutral-300 px-3 py-2" name="displayName" defaultValue={user.displayName} disabled={props.currentRole !== "owner"} />
              <select className="rounded-xl border border-neutral-300 px-3 py-2" name="role" defaultValue={user.role} disabled={props.currentRole !== "owner"}>
                <option value="admin">admin</option>
                <option value="owner">owner</option>
              </select>
              <select className="rounded-xl border border-neutral-300 px-3 py-2" name="status" defaultValue={user.status} disabled={props.currentRole !== "owner"}>
                <option value="active">active</option>
                <option value="disabled">disabled</option>
              </select>
              {props.currentRole === "owner" ? (
                <button className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium" disabled={isPending} type="submit">
                  Save
                </button>
              ) : null}
            </form>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <h2 className="text-2xl font-semibold">MCP clients</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Allowlist OIDC client IDs that can call <code>/mcp</code>.
        </p>

        <form
          className="mt-5 grid gap-3 md:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formElement = event.currentTarget;
            const form = new FormData(event.currentTarget);
            handleFormAction(async () => {
              await submitJson("/api/admin/mcp-clients", "POST", {
                oidcClientId: form.get("oidcClientId"),
                displayName: form.get("displayName"),
                allowedScope: form.get("allowedScope"),
                notes: form.get("notes"),
              });
              formElement.reset();
            });
          }}
        >
          <input className="rounded-xl border border-neutral-300 px-3 py-2" name="oidcClientId" placeholder="OIDC client ID" required />
          <input className="rounded-xl border border-neutral-300 px-3 py-2" name="displayName" placeholder="Display name" required />
          <input className="rounded-xl border border-neutral-300 px-3 py-2" name="allowedScope" defaultValue="mcp:read" />
          <input className="rounded-xl border border-neutral-300 px-3 py-2" name="notes" placeholder="Notes (optional)" />
          <button className="rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 md:col-span-4" disabled={isPending} type="submit">
            Add MCP client
          </button>
        </form>

        <div className="mt-5 space-y-3">
          {props.mcpClients.map((client) => (
            <form
              key={client.id}
              className="grid gap-3 rounded-2xl border border-neutral-200 bg-white/80 p-4 md:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto]"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                handleFormAction(async () => {
                  await submitJson("/api/admin/mcp-clients", "PATCH", {
                    id: client.id,
                    displayName: form.get("displayName"),
                    allowedScope: form.get("allowedScope"),
                    notes: form.get("notes"),
                    status: form.get("status"),
                  });
                });
              }}
            >
              <div>
                <p className="text-sm font-medium">{client.displayName}</p>
                <p className="mt-1 text-xs text-neutral-500">{client.oidcClientId}</p>
              </div>
              <input className="rounded-xl border border-neutral-300 px-3 py-2" name="displayName" defaultValue={client.displayName} />
              <input className="rounded-xl border border-neutral-300 px-3 py-2" name="allowedScope" defaultValue={client.allowedScope} />
              <div className="grid gap-3 md:grid-cols-2">
                <select className="rounded-xl border border-neutral-300 px-3 py-2" name="status" defaultValue={client.status}>
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                </select>
                <input className="rounded-xl border border-neutral-300 px-3 py-2" name="notes" defaultValue={client.notes ?? ""} placeholder="Notes" />
              </div>
              <button className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium" disabled={isPending} type="submit">
                Save
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Audit log</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Filter auth and admin events without leaving the page.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              className="rounded-xl border border-neutral-300 px-3 py-2"
              placeholder="Event type"
              value={auditEventType}
              onChange={(event) => setAuditEventType(event.target.value)}
            />
            <input
              className="rounded-xl border border-neutral-300 px-3 py-2"
              placeholder="Outcome"
              value={auditOutcome}
              onChange={(event) => setAuditOutcome(event.target.value)}
            />
            <button
              className="rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium"
              disabled={isPending}
              onClick={() => handleFormAction(refreshAuditLogs, { refresh: false })}
              type="button"
            >
              Filter logs
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="pb-3 pr-4">When</th>
                <th className="pb-3 pr-4">Event</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Client</th>
                <th className="pb-3 pr-4">Route</th>
                <th className="pb-3 pr-4">Outcome</th>
                <th className="pb-3">Reason</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id} className="border-t border-neutral-200">
                  <td className="py-3 pr-4 text-neutral-600">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="py-3 pr-4 font-medium">{log.eventType}</td>
                  <td className="py-3 pr-4">{log.email ?? "—"}</td>
                  <td className="py-3 pr-4">{log.clientId ?? "—"}</td>
                  <td className="py-3 pr-4">{log.route ?? "—"}</td>
                  <td className="py-3 pr-4">{log.outcome}</td>
                  <td className="py-3">{log.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
