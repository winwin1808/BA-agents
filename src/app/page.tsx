import Link from "next/link";

import { getAppMeta } from "@/lib/app-meta";
import { getPublicEnv } from "@/lib/env";

const endpointCards = [
  {
    path: "/mcp",
    title: "Protected MCP endpoint",
    description: "Stateless Streamable HTTP server for BA and PM context retrieval.",
  },
  {
    path: "/docs",
    title: "Public docs",
    description: "Docs for auth flow, server metadata, tools, resources, and examples.",
  },
  {
    path: "/admin",
    title: "Admin",
    description: "Minimal admin UI for allowlisted clients, admin users, and audit logs.",
  },
];

export default function HomePage() {
  const meta = getAppMeta();
  const env = getPublicEnv();

  return (
    <main className="py-8 md:py-12">
      <section className="panel overflow-hidden px-6 py-8 md:px-10 md:py-12">
        <div className="eyebrow">BSS Commerce • Remote MCP</div>
        <div className="mt-6 grid gap-10 md:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-5">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
              Read-only MCP access for the BA-agents context library.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-neutral-700">
              This app indexes the markdown knowledge base in <code>context/</code>,
              exposes it over a protected MCP server, publishes public integration
              docs, and keeps admin access lightweight.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="rounded-full bg-blue-300 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-50"
              >
                Open docs
              </Link>
              <Link
                href="/admin"
                className="rounded-full border border-neutral-300 px-5 py-3 text-sm font-medium transition hover:border-neutral-500"
              >
                Open admin
              </Link>
            </div>
          </div>
          <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white/70 p-5">
            <div>
              <p className="text-sm font-medium text-neutral-500">Server</p>
              <p className="mt-1 text-xl font-semibold">{meta.title}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Version</p>
              <p className="mt-1 text-lg">{meta.version}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Base URL</p>
              <p className="mt-1 break-all text-sm text-neutral-700">{env.baseUrl}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Required MCP scope</p>
              <p className="mt-1 font-mono text-sm">{env.mcpScope}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {endpointCards.map((card) => (
          <div key={card.path} className="panel p-6">
            <p className="text-sm font-medium text-neutral-500">{card.path}</p>
            <h2 className="mt-2 text-xl font-semibold">{card.title}</h2>
            <p className="mt-3 text-sm leading-7 text-neutral-700">{card.description}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
