"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition, type RefObject } from "react";

import { buildTokenSharePackage } from "@/lib/admin/token-share";

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

type PersonalAccessTokenRow = {
  id: string;
  label: string;
  ownerEmail: string;
  tokenValue?: string | null;
  tokenPrefix: string;
  status: "active" | "disabled";
  allowedScope: string;
  notes: string | null;
  lastUsedAt: string | null;
  expiresAt: string | null;
};

type Toast = {
  id: number;
  tone: "success" | "info" | "error";
  message: string;
};

function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Never";
}

function formatInputDateTime(value: string | null) {
  return value ? value.slice(0, 16) : "";
}

const fieldClassName =
  "rounded-xl border border-neutral-300 px-3 py-2 transition hover:border-neutral-500 focus:border-neutral-700 focus:outline-none";
const buttonClassName =
  "rounded-xl border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:border-neutral-500 hover:bg-neutral-50 disabled:opacity-50";
const primaryButtonClassName =
  "rounded-xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-60";

function IconButton(props: {
  title: string;
  tone?: "default" | "danger";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const className =
    props.tone === "danger"
      ? "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-300 text-rose-700 transition hover:border-rose-500 hover:bg-rose-50"
      : "inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-300 text-neutral-700 transition hover:border-neutral-500 hover:bg-white";

  return (
    <button
      aria-label={props.title}
      className={className}
      onClick={props.onClick}
      title={props.title}
      type="button"
    >
      {props.children}
    </button>
  );
}

function TokenCreateModal(props: {
  open: boolean;
  busy: boolean;
  onClose: () => void;
  onSubmit: (form: HTMLFormElement) => void;
}) {
  if (!props.open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">Create personal access token</h3>
            <p className="mt-2 text-sm leading-7 text-neutral-600">
              Create one bearer token per user. The token value will only be shown once.
            </p>
          </div>
          <button
            className={buttonClassName}
            onClick={props.onClose}
            type="button"
          >
            Close
          </button>
        </div>

        <form
          className="mt-6 grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            props.onSubmit(event.currentTarget);
          }}
        >
          <div className="grid gap-2">
            <label className="text-sm font-medium">Label</label>
            <input className={fieldClassName} name="label" placeholder="Hao - Cursor" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Owner email</label>
            <input className={fieldClassName} name="ownerEmail" placeholder="owner@company.com" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Allowed scope</label>
            <input className={fieldClassName} defaultValue="mcp:read" name="allowedScope" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Expires at</label>
            <input className={fieldClassName} name="expiresAt" type="datetime-local" />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <input className={fieldClassName} name="notes" placeholder="Optional note" />
          </div>
          <div className="flex justify-end gap-3 md:col-span-2">
            <button
              className={buttonClassName}
              onClick={props.onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className={primaryButtonClassName}
              disabled={props.busy}
              type="submit"
            >
              Create token
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TokenEditModal(props: {
  open: boolean;
  busy: boolean;
  token: PersonalAccessTokenRow | null;
  onClose: () => void;
  onSubmit: (form: HTMLFormElement) => void;
}) {
  if (!props.open || !props.token) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-neutral-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">Edit personal access token</h3>
            <p className="mt-2 text-sm leading-7 text-neutral-600">
              Update label, owner, scope, expiry, or disable the token.
            </p>
          </div>
          <button className={buttonClassName} onClick={props.onClose} type="button">
            Close
          </button>
        </div>

        <form
          className="mt-6 grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            props.onSubmit(event.currentTarget);
          }}
        >
          <input name="id" type="hidden" value={props.token.id} />
          <div className="grid gap-2">
            <label className="text-sm font-medium">Label</label>
            <input className={fieldClassName} defaultValue={props.token.label} name="label" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Owner email</label>
            <input className={fieldClassName} defaultValue={props.token.ownerEmail} name="ownerEmail" required />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Allowed scope</label>
            <input className={fieldClassName} defaultValue={props.token.allowedScope} name="allowedScope" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Status</label>
            <select className={fieldClassName} defaultValue={props.token.status} name="status">
              <option value="active">active</option>
              <option value="disabled">disabled</option>
            </select>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Expires at</label>
            <input
              className={fieldClassName}
              defaultValue={formatInputDateTime(props.token.expiresAt)}
              name="expiresAt"
              type="datetime-local"
            />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm font-medium">Notes</label>
            <input className={fieldClassName} defaultValue={props.token.notes ?? ""} name="notes" placeholder="Optional note" />
          </div>
          <div className="flex justify-end gap-3 md:col-span-2">
            <button className={buttonClassName} onClick={props.onClose} type="button">
              Cancel
            </button>
            <button className={primaryButtonClassName} disabled={props.busy} type="submit">
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreatedTokenModal(props: {
  open: boolean;
  token: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onCopyPackage: () => void;
  onCopyToken: () => void;
  onSelect: () => void;
}) {
  if (!props.open || !props.token) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-3xl border border-emerald-200 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-semibold">Token created</h3>
            <p className="mt-2 text-sm leading-7 text-neutral-600">
              Copy the raw token for direct use, or copy a share package that includes the token plus the BA Agents MCP skill text.
            </p>
          </div>
          <button className={buttonClassName} onClick={props.onClose} type="button">
            Close
          </button>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-950">Personal access token</p>
          <div className="mt-3 rounded-xl border border-emerald-200 bg-white px-3 py-2">
            <input
              className="w-full bg-transparent font-mono text-sm outline-none"
              ref={props.inputRef}
              onFocus={(event) => event.currentTarget.select()}
              readOnly
              value={props.token}
            />
          </div>
          <p className="mt-3 text-xs text-emerald-900/80">
            Use this value as <code>Authorization: Bearer ...</code> in Cursor or Codex.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button className={buttonClassName} onClick={props.onSelect} type="button">
            Select token
          </button>
          <button className={buttonClassName} onClick={props.onCopyToken} type="button">
            Copy token only
          </button>
          <button className={primaryButtonClassName} onClick={props.onCopyPackage} type="button">
            Copy token + skill
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminDashboard(props: {
  currentRole: "owner" | "admin";
  adminUsers: AdminUserRow[];
  mcpClients: McpClientRow[];
  personalAccessTokens: PersonalAccessTokenRow[];
  auditLogs: AuditLogRow[];
  dbConfigured: boolean;
}) {
  const router = useRouter();
  const createdTokenInputRef = useRef<HTMLInputElement | null>(null);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRow[]>(props.auditLogs);
  const [auditEventType, setAuditEventType] = useState("");
  const [auditOutcome, setAuditOutcome] = useState("");
  const [auditPage, setAuditPage] = useState(1);
  const [isPatModalOpen, setIsPatModalOpen] = useState(false);
  const [editingPat, setEditingPat] = useState<PersonalAccessTokenRow | null>(null);
  const [isPending, startTransition] = useTransition();

  const pageSize = 12;
  const totalAuditPages = Math.max(1, Math.ceil(auditLogs.length / pageSize));
  const visibleAuditLogs = useMemo(
    () => auditLogs.slice((auditPage - 1) * pageSize, auditPage * pageSize),
    [auditLogs, auditPage],
  );

  function pushToast(tone: Toast["tone"], message: string) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((current) => [...current, { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }

  async function submitJson(path: string, method: "POST" | "PATCH" | "DELETE", body: unknown) {
    const response = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json().catch(() => ({}))) as {
      error?: string;
      message?: string;
      token?: string;
    };
    if (!response.ok) {
      throw new Error(payload.error ?? payload.message ?? "Request failed");
    }

    return payload;
  }

  function handleFormAction(action: () => Promise<void>, options?: { refresh?: boolean }) {
    startTransition(async () => {
      try {
        await action();
        if (options?.refresh !== false) {
          router.refresh();
        }
        pushToast("success", "Saved.");
      } catch (error) {
        pushToast("error", error instanceof Error ? error.message : "Request failed");
      }
    });
  }

  function fallbackCopyText(value: string) {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copied) {
      throw new Error("Copy failed. Please use Select token and copy manually.");
    }
  }

  async function copyText(value: string, successLabel: string) {
    try {
      if (!navigator.clipboard?.writeText) {
        fallbackCopyText(value);
      } else {
        await navigator.clipboard.writeText(value);
      }
      pushToast("info", `Copied: ${successLabel}`);
    } catch {
      fallbackCopyText(value);
      pushToast("info", `Copied: ${successLabel}`);
    }
  }

  function selectCreatedToken() {
    createdTokenInputRef.current?.focus();
    createdTokenInputRef.current?.select();
  }

  function buildMcpSnippet(token: PersonalAccessTokenRow) {
    if (!token.tokenValue) {
      throw new Error("This token was created before full token storage was enabled. Create a new token to copy MCP config.");
    }

    return JSON.stringify(
      {
        mcpServers: {
          baAgents: {
            type: "http",
            url: `${window.location.origin}/mcp`,
            headers: {
              authorization: `Bearer ${token.tokenValue}`,
            },
          },
        },
      },
      null,
      2,
    );
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
    setAuditPage(1);
  }

  function handleRemoveToken(token: PersonalAccessTokenRow) {
    const confirmed = window.confirm(
      `Remove token "${token.label}" for ${token.ownerEmail}? This cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }

    handleFormAction(async () => {
      await submitJson("/api/admin/personal-access-tokens", "DELETE", {
        id: token.id,
      });
      if (editingPat?.id === token.id) {
        setEditingPat(null);
      }
      setCreatedToken(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="pointer-events-none fixed right-4 top-4 z-[60] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((toast) => {
          const toneClassName =
            toast.tone === "error"
              ? "border-rose-300 bg-rose-50 text-rose-950"
              : toast.tone === "success"
                ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                : "border-sky-300 bg-sky-50 text-sky-950";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-lg ${toneClassName}`}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
      <CreatedTokenModal
        inputRef={createdTokenInputRef}
        onClose={() => setCreatedToken(null)}
        onCopyPackage={() => {
          if (createdToken) {
            void copyText(buildTokenSharePackage(createdToken), "new PAT + skill");
          }
        }}
        onCopyToken={() => {
          if (createdToken) {
            void copyText(createdToken, "new PAT");
          }
        }}
        onSelect={selectCreatedToken}
        open={Boolean(createdToken)}
        token={createdToken}
      />
      <TokenCreateModal
        busy={isPending}
        open={isPatModalOpen}
        onClose={() => setIsPatModalOpen(false)}
        onSubmit={(formElement) => {
          const form = new FormData(formElement);
          handleFormAction(async () => {
            const payload = await submitJson("/api/admin/personal-access-tokens", "POST", {
              label: form.get("label"),
              ownerEmail: form.get("ownerEmail"),
              allowedScope: form.get("allowedScope"),
              notes: form.get("notes"),
              expiresAt: form.get("expiresAt")
                ? new Date(String(form.get("expiresAt"))).toISOString()
                : null,
            });
            setCreatedToken(payload.token ?? null);
            setIsPatModalOpen(false);
          });
        }}
      />
      <TokenEditModal
        busy={isPending}
        open={Boolean(editingPat)}
        token={editingPat}
        onClose={() => setEditingPat(null)}
        onSubmit={(formElement) => {
          const form = new FormData(formElement);
          handleFormAction(async () => {
            await submitJson("/api/admin/personal-access-tokens", "PATCH", {
              id: form.get("id"),
              label: form.get("label"),
              ownerEmail: form.get("ownerEmail"),
              allowedScope: form.get("allowedScope"),
              notes: form.get("notes"),
              status: form.get("status"),
              expiresAt: form.get("expiresAt")
                ? new Date(String(form.get("expiresAt"))).toISOString()
                : null,
            });
            setEditingPat(null);
          });
        }}
      />

      {!props.dbConfigured ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Admin data store is not configured. Set <code>SUPABASE_URL</code> and{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code>, or fall back to <code>POSTGRES_URL</code>.
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
              const form = new FormData(formElement);
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
            <input className={fieldClassName} name="email" placeholder="email@company.com" required />
            <input className={fieldClassName} name="displayName" placeholder="Display name" required />
            <select className={fieldClassName} defaultValue="admin" name="role">
              <option value="admin">admin</option>
              <option value="owner">owner</option>
            </select>
            <button className={primaryButtonClassName} disabled={isPending} type="submit">
              Add admin
            </button>
          </form>
        ) : null}

        <div className="mt-5 space-y-3">
          {props.adminUsers.map((user) => (
            <form
              key={user.id}
              className="grid gap-3 rounded-2xl border border-neutral-200 bg-white/80 p-4 transition hover:border-neutral-300 hover:bg-white md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_auto]"
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
                <p className="mt-1 text-xs text-neutral-500">Last login: {formatDateTime(user.lastLoginAt)}</p>
              </div>
              <input className={fieldClassName} defaultValue={user.displayName} disabled={props.currentRole !== "owner"} name="displayName" />
              <select className={fieldClassName} defaultValue={user.role} disabled={props.currentRole !== "owner"} name="role">
                <option value="admin">admin</option>
                <option value="owner">owner</option>
              </select>
              <select className={fieldClassName} defaultValue={user.status} disabled={props.currentRole !== "owner"} name="status">
                <option value="active">active</option>
                <option value="disabled">disabled</option>
              </select>
              {props.currentRole === "owner" ? (
                <button className={buttonClassName} disabled={isPending} type="submit">
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
            const form = new FormData(formElement);
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
          <input className={fieldClassName} name="oidcClientId" placeholder="OIDC client ID" required />
          <input className={fieldClassName} name="displayName" placeholder="Display name" required />
          <input className={fieldClassName} defaultValue="mcp:read" name="allowedScope" />
          <input className={fieldClassName} name="notes" placeholder="Notes (optional)" />
          <button className={`${primaryButtonClassName} md:col-span-4`} disabled={isPending} type="submit">
            Add MCP client
          </button>
        </form>

        <div className="mt-5 space-y-3">
          {props.mcpClients.map((client) => (
            <form
              key={client.id}
              className="grid gap-3 rounded-2xl border border-neutral-200 bg-white/80 p-4 transition hover:border-neutral-300 hover:bg-white md:grid-cols-[1fr_1fr_0.8fr_0.8fr_auto]"
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
              <input className={fieldClassName} defaultValue={client.displayName} name="displayName" />
              <input className={fieldClassName} defaultValue={client.allowedScope} name="allowedScope" />
              <div className="grid gap-3 md:grid-cols-2">
                <select className={fieldClassName} defaultValue={client.status} name="status">
                  <option value="active">active</option>
                  <option value="disabled">disabled</option>
                </select>
                <input className={fieldClassName} defaultValue={client.notes ?? ""} name="notes" placeholder="Notes" />
              </div>
              <button className={buttonClassName} disabled={isPending} type="submit">
                Save
              </button>
            </form>
          ))}
        </div>
      </section>

      <section className="panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Personal access tokens</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Create one bearer token per user for simple MCP access without OAuth client setup.
            </p>
          </div>
          <button
            className={primaryButtonClassName}
            disabled={isPending}
            onClick={() => setIsPatModalOpen(true)}
            type="button"
          >
            Create new token
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-neutral-500">
              <tr>
                <th className="pb-3 pr-4">Label</th>
                <th className="pb-3 pr-4">Owner</th>
                <th className="pb-3 pr-4">Prefix</th>
                <th className="pb-3 pr-4">Scope</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Last used</th>
                <th className="pb-3 pr-4">Expires</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {props.personalAccessTokens.map((token) => (
                <tr key={token.id} className="border-t border-neutral-200 align-top transition hover:bg-neutral-50/80">
                  <td className="whitespace-nowrap py-3 pr-4 font-medium">{token.label}</td>
                  <td className="whitespace-nowrap py-3 pr-4">{token.ownerEmail}</td>
                  <td className="whitespace-nowrap py-3 pr-4 font-mono text-xs">{token.tokenPrefix}••••••••</td>
                  <td className="whitespace-nowrap py-3 pr-4">{token.allowedScope}</td>
                  <td className="whitespace-nowrap py-3 pr-4">{token.status}</td>
                  <td className="whitespace-nowrap py-3 pr-4">{formatDateTime(token.lastUsedAt)}</td>
                  <td className="whitespace-nowrap py-3 pr-4">
                    {token.expiresAt ? new Date(token.expiresAt).toLocaleString() : "No expiry"}
                  </td>
                  <td className="whitespace-nowrap py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-medium transition hover:border-neutral-500 hover:bg-white"
                        onClick={() => void copyText(buildMcpSnippet(token), `${token.label} MCP config`)}
                        type="button"
                      >
                        Copy MCP config
                      </button>
                      <IconButton onClick={() => setEditingPat(token)} title="Edit token">
                        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <path d="M4 20h4l10-10-4-4L4 16v4Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                          <path d="m12 6 4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                        </svg>
                      </IconButton>
                      <IconButton onClick={() => handleRemoveToken(token)} title="Remove token" tone="danger">
                        <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <path d="M4 7h16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                          <path d="M10 11v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                          <path d="M14 11v6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
                          <path d="M6 7l1 12h10l1-12" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                          <path d="M9 7V5h6v2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
                        </svg>
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              className={fieldClassName}
              onChange={(event) => setAuditEventType(event.target.value)}
              placeholder="Event type"
              value={auditEventType}
            />
            <input
              className={fieldClassName}
              onChange={(event) => setAuditOutcome(event.target.value)}
              placeholder="Outcome"
              value={auditOutcome}
            />
            <button
              className={buttonClassName}
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
              {visibleAuditLogs.map((log) => (
                <tr key={log.id} className="border-t border-neutral-200 transition hover:bg-neutral-50/80">
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

        <div className="mt-5 flex items-center justify-between gap-4 text-sm">
          <p className="text-neutral-600">
            Page {auditPage} of {totalAuditPages}
          </p>
          <div className="flex gap-2">
            <button
              className={buttonClassName}
              disabled={auditPage <= 1}
              onClick={() => setAuditPage((page) => Math.max(1, page - 1))}
              type="button"
            >
              Previous
            </button>
            <button
              className={buttonClassName}
              disabled={auditPage >= totalAuditPages}
              onClick={() => setAuditPage((page) => Math.min(totalAuditPages, page + 1))}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
