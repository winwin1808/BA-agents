import Link from "next/link";

import { getAppMeta } from "@/lib/app-meta";
import { getPublicResourceCatalog } from "@/lib/content/server";
import { getPublicEnv } from "@/lib/env";

const toolDocs = [
  "list_documents(category?, app?)",
  "get_document(uri)",
  "search_context(query, category?, app?, limit?)",
  "get_changelog(app?, query?, limit?)",
  "suggest_context_bundle(task_type, app?)",
];

const promptDocs = [
  "draft_prd",
  "synthesize_discovery",
  "write_help_doc",
  "analyze_strategy",
];

export default function DocsPage() {
  const meta = getAppMeta();
  const env = getPublicEnv();
  const resources = getPublicResourceCatalog();

  return (
    <main className="py-8 md:py-12">
      <section className="panel px-6 py-8 md:px-10 md:py-10">
        <div className="eyebrow">Public docs</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
          {meta.title} integration docs
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-neutral-700">
          This server publishes a read-only MCP interface on top of the BA-agents
          markdown repository. OAuth metadata is public. MCP access and admin access
          are protected.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link className="rounded-full border border-neutral-300 px-4 py-2" href="/server.json">
            /server.json
          </Link>
          <Link className="rounded-full border border-neutral-300 px-4 py-2" href="/docs/openapi.json">
            /docs/openapi.json
          </Link>
          <Link
            className="rounded-full border border-neutral-300 px-4 py-2"
            href="/.well-known/oauth-protected-resource"
          >
            /.well-known/oauth-protected-resource
          </Link>
        </div>
      </section>

      <section id="overview" className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">Overview</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
            <li>Transport: Streamable HTTP, stateless, JSON responses enabled.</li>
            <li>Protected endpoint: <code>POST {env.baseUrl}/mcp</code>.</li>
            <li>Content source: build-time scan of <code>context/</code>.</li>
            <li>Public surfaces: landing, docs, OAuth metadata, server metadata.</li>
          </ul>
        </div>
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">Auth flow</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
            <li>Authorization source: external OIDC issuer configured via env.</li>
            <li>MCP token requirements: valid issuer, audience, scope, and allowlisted client.</li>
            <li>Required MCP scope: <code>{env.mcpScope}</code>.</li>
            <li>Admin scope target: <code>{env.adminScope}</code>.</li>
          </ul>
        </div>
      </section>

      <section id="mcp-endpoint" className="panel mt-8 p-6">
        <h2 className="text-2xl font-semibold">MCP endpoint</h2>
        <p className="mt-3 text-sm leading-7 text-neutral-700">
          Use <code>POST /mcp</code> with a bearer token and JSON-RPC messages. The
          server is stateless and optimized for Vercel serverless execution.
        </p>
        <pre className="mt-5 overflow-x-auto rounded-2xl bg-neutral-950 p-5 text-sm leading-7 text-neutral-100">
          {`curl -X POST "${env.baseUrl}/mcp" \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": "init-1",
    "method": "initialize",
    "params": {
      "protocolVersion": "2025-03-26",
      "capabilities": {},
      "clientInfo": { "name": "example-client", "version": "1.0.0" }
    }
  }'`}
        </pre>
      </section>

      <section id="resources" className="panel mt-8 p-6">
        <h2 className="text-2xl font-semibold">Resources</h2>
        <p className="mt-3 text-sm leading-7 text-neutral-700">
          Every indexed markdown file is exposed as a stable <code>bss://</code> resource.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {resources.map((resource) => (
            <div key={resource.uri} className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
              <p className="font-mono text-xs text-neutral-500">{resource.uri}</p>
              <p className="mt-2 font-semibold">{resource.title}</p>
              <p className="mt-1 text-sm text-neutral-600">{resource.summary}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tools" className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-2xl font-semibold">Tools</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
            {toolDocs.map((tool) => (
              <li key={tool}>
                <code>{tool}</code>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-6">
          <h2 className="text-2xl font-semibold">Prompts</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
            {promptDocs.map((prompt) => (
              <li key={prompt}>
                <code>{prompt}</code>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="examples" className="panel mt-8 p-6">
        <h2 className="text-2xl font-semibold">Examples</h2>
        <pre className="mt-5 overflow-x-auto rounded-2xl bg-neutral-950 p-5 text-sm leading-7 text-neutral-100">
          {`{
  "jsonrpc": "2.0",
  "id": "tools-1",
  "method": "tools/call",
  "params": {
    "name": "search_context",
    "arguments": {
      "query": "price list approval",
      "app": "solution",
      "limit": 5
    }
  }
}`}
        </pre>
      </section>

      <section id="server-metadata" className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-2xl font-semibold">Server metadata</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
            <li>
              <code>/server.json</code> points clients to <code>{env.baseUrl}/mcp</code>.
            </li>
            <li>
              <code>/docs/openapi.json</code> documents non-MCP HTTP endpoints.
            </li>
            <li>
              <code>/.well-known/oauth-authorization-server</code> exposes local OAuth server metadata.
            </li>
          </ul>
        </div>
        <div className="panel p-6">
          <h2 className="text-2xl font-semibold">Admin APIs</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
            <li>
              <code>GET/POST/PATCH /api/admin/admin-users</code>
            </li>
            <li>
              <code>GET/POST/PATCH /api/admin/mcp-clients</code>
            </li>
            <li>
              <code>GET /api/admin/audit-logs</code>
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
