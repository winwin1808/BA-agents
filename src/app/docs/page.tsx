import { getAppMeta } from "@/lib/app-meta";
import { getPublicEnv } from "@/lib/env";

const tools = [
  {
    name: "search_context",
    useCase: "Search the knowledge base by keyword with metadata bias for app, task type, and feature area.",
    example: 'Find pricing approval context in Solution for a PRD.',
  },
  {
    name: "get_document",
    useCase: "Open one exact resource when you already know its URI.",
    example: "Open the PRD template directly.",
  },
  {
    name: "list_documents",
    useCase: "Browse available resources with structured filters before selecting one.",
    example: "List all Quote app documents for help docs.",
  },
  {
    name: "get_changelog",
    useCase: "Check shipped names and public behavior before writing docs or specs.",
    example: "Find recent changelog items for Lock.",
  },
  {
    name: "suggest_context_bundle",
    useCase: "Get the minimum set of documents needed for a task.",
    example: "Suggest the right bundle for a Solution PRD.",
  },
  {
    name: "get_resource_catalog",
    useCase: "Inspect the indexed inventory by kind, app, and freshness.",
    example: "Show the MCP catalog health summary.",
  },
  {
    name: "generate_reference_ui",
    useCase: "Generate a very basic reference UI with v0 from the full confirmed UX/UI task and return a preview URL.",
    example: "Generate a basic reference UI from the confirmed task for Solution pricing setup.",
  },
];

const prompts = [
  {
    name: "draft_prd",
    useCase: "Draft a PRD or RQM with the repo's shared structure.",
  },
  {
    name: "synthesize_discovery",
    useCase: "Turn interviews, tickets, and notes into evidence and opportunities.",
  },
  {
    name: "write_help_doc",
    useCase: "Write a merchant-facing guide using the help-doc template.",
  },
  {
    name: "analyze_strategy",
    useCase: "Run strategic analysis with DHM, SWOT, or Devil's Advocate.",
  },
];

const exampleUris = [
  "bss://company",
  "bss://segments",
  "bss://app/solution/context",
  "bss://template/prd",
  "bss://template/help-doc",
];

export default function DocsPage() {
  const meta = getAppMeta();
  const env = getPublicEnv();

  return (
    <main className="py-8 md:py-12">
      <section className="panel px-6 py-8 md:px-10 md:py-10">
        <div className="eyebrow">User docs</div>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
          Connect and use {meta.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-neutral-700">
          This MCP server gives your AI access to the BA-agents knowledge base:
          company context, app context, templates, discovery frameworks, and
          changelog material for the BSS B2B Suite.
        </p>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">What you need</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
            <li>The MCP server URL: <code>{env.baseUrl}/mcp</code>.</li>
            <li>A personal access token from your admin, or OAuth access if your team uses that flow.</li>
            <li>An MCP-capable client such as Cursor or Codex.</li>
          </ul>
        </div>
        <div className="panel p-6">
          <h2 className="text-xl font-semibold">Recommended auth</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
            <li>For most users, the easiest option is a personal access token.</li>
            <li>Your admin creates one token per user and sends it to you once.</li>
            <li>Required MCP scope: <code>{env.mcpScope}</code>.</li>
          </ul>
        </div>
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="text-2xl font-semibold">Quick start</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="text-sm font-medium text-neutral-500">Step 1</p>
            <p className="mt-2 font-semibold">Get your token</p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              Ask your admin for a personal access token for BA Agents MCP.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="text-sm font-medium text-neutral-500">Step 2</p>
            <p className="mt-2 font-semibold">Add the server</p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              Add <code>{env.baseUrl}/mcp</code> to Cursor or Codex with an Authorization header.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="text-sm font-medium text-neutral-500">Step 3</p>
            <p className="mt-2 font-semibold">Ask useful questions</p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              Search context, open templates, and generate structured output from the repo.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-2xl font-semibold">Use with Cursor</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-700">
            Add this server to your Cursor MCP config.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-neutral-950 p-5 text-sm leading-7 text-neutral-100">
            {`{
  "mcpServers": {
    "baAgents": {
      "url": "${env.baseUrl}/mcp",
      "headers": {
        "Authorization": "Bearer bss_pat_your_token_here"
      }
    }
  }
}`}
          </pre>
        </div>
        <div className="panel p-6">
          <h2 className="text-2xl font-semibold">Use with Codex</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-700">
            Add the MCP server in your Codex config and pass the same bearer token.
          </p>
          <pre className="mt-5 overflow-x-auto rounded-2xl bg-neutral-950 p-5 text-sm leading-7 text-neutral-100">
            {`[mcp_servers.baAgents]
url = "${env.baseUrl}/mcp"

[mcp_servers.baAgents.headers]
Authorization = "Bearer bss_pat_your_token_here"`}
          </pre>
        </div>
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="text-2xl font-semibold">Easy examples</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="font-semibold">Example 1: Find context for a PRD</p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              Ask your AI: <code>Search BA Agents for Solution pricing approval context, task type PRD, and suggest the best starter bundle.</code>
            </p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              The MCP client will typically call <code>search_context</code> and <code>suggest_context_bundle</code>.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="font-semibold">Example 2: Open a template directly</p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              Ask your AI: <code>Open the PRD template from BA Agents and draft a Quote feature PRD.</code>
            </p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              The MCP client can use <code>get_document</code> with <code>bss://template/prd</code>.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="font-semibold">Example 3: Check shipped naming</p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              Ask your AI: <code>Find recent Lock changelog notes before I write a help article for hide price.</code>
            </p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              The MCP client can use <code>get_changelog</code>.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="font-semibold">Example 4: Inspect the catalog</p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              Ask your AI: <code>Show the BA Agents resource catalog by kind and freshness.</code>
            </p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              The MCP client can use <code>get_resource_catalog</code>.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="font-semibold">Example 5: Generate a UI reference</p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              Ask your AI: <code>Use generate_reference_ui with the full confirmed UX/UI task for Quote history in customer account.</code>
            </p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              The MCP client can use <code>generate_reference_ui</code> and return a v0 demo URL.
            </p>
          </div>
        </div>
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="text-2xl font-semibold">Built-in prompts</h2>
        <p className="mt-3 text-sm leading-7 text-neutral-700">
          The server also exposes ready-made prompts for PRD, discovery, help docs, and strategy analysis.
        </p>
        <ul className="mt-4 space-y-4 text-sm leading-7 text-neutral-700">
          {prompts.map((prompt) => (
            <li key={prompt.name}>
              <p>
                <code>{prompt.name}</code>
              </p>
              <p>{prompt.useCase}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="panel p-6">
          <h2 className="text-2xl font-semibold">Main tools</h2>
          <ul className="mt-4 space-y-4 text-sm leading-7 text-neutral-700">
            {tools.map((tool) => (
              <li key={tool.name}>
                <p>
                  <code>{tool.name}</code>
                </p>
                <p>{tool.useCase}</p>
                <p className="text-neutral-500">Example: {tool.example}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel p-6">
          <h2 className="text-2xl font-semibold">Retrieval tips</h2>
          <ul className="mt-4 space-y-4 text-sm leading-7 text-neutral-700">
            <li>
              Add <code>app</code>, <code>task_type</code>, or <code>feature_area</code> when your first search is too broad.
            </li>
            <li>
              Use <code>get_document</code> after <code>search_context</code> when you need the canonical source, metadata, and related documents.
            </li>
            <li>
              Use <code>suggest_context_bundle</code> before drafting so your AI starts from the minimum trusted context instead of guessing.
            </li>
            <li>
              Use <code>generate_reference_ui</code> only after the UX/UI task is confirmed, and pass the full confirmed task text into the tool call.
            </li>
          </ul>
        </div>
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="text-2xl font-semibold">Useful resource URIs</h2>
        <p className="mt-3 text-sm leading-7 text-neutral-700">
          You can open these directly with <code>get_document</code>.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {exampleUris.map((uri) => (
            <div key={uri} className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
              <code className="text-sm">{uri}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="text-2xl font-semibold">Troubleshooting</h2>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
          <li>If you get <code>401</code>, your token is missing, invalid, disabled, or expired.</li>
          <li>If your MCP client connects but finds nothing useful, add a more specific tool call such as <code>search_context</code> with <code>app</code>, <code>task_type</code>, or <code>feature_area</code>.</li>
          <li>If you do not have a token yet, contact your admin and ask for a personal access token for BA Agents MCP.</li>
        </ul>
      </section>
    </main>
  );
}
