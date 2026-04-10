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
    name: "generate_workflow_artifact",
    useCase: "Generate and persist a workflow diagram artifact with a BPMN-ready graph and shareable URLs.",
    example: "Generate a workflow artifact for a Quote approval flow with manager approval.",
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
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="font-semibold">Example 6: Generate a workflow diagram</p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              Ask your AI: <code>Use generate_workflow_artifact with context_scope=&quot;quote&quot; and a prompt that lists Trigger, Actors, Main flow, Decisions, Exceptions, and End states for one Quote approval workflow.</code>
            </p>
            <p className="mt-2 text-sm leading-7 text-neutral-700">
              The MCP client can use <code>generate_workflow_artifact</code> and return the saved artifact URL plus the normalized workflow graph.
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

      <section className="panel mt-8 p-6">
        <h2 className="text-2xl font-semibold">Diagram generation</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-700">
          BA Agents supports AI-assisted workflow diagram generation through the
          MCP tool <code>generate_workflow_artifact</code> and the web page
          <code> /workflows</code>. Use this when you want to map a business
          process, approval flow, or operational sequence as a BPMN diagram
          instead of a text-only spec. The saved artifact page is intentionally
          diagram-first.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="font-semibold">What it generates</p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-neutral-700">
              <li>A constrained BPMN workflow diagram.</li>
              <li>A normalized workflow graph.</li>
              <li>A saved artifact page that can be reopened and shared internally.</li>
              <li>Optional raw BPMN XML when requested by the client.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="font-semibold">Best use cases</p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-neutral-700">
              <li>Quote approval flows with thresholds and handoff points.</li>
              <li>Registration, review, and approval processes in Solution.</li>
              <li>Lock access-control or onboarding flows with decision gates.</li>
              <li>Cross-team operational processes that need one shareable diagram.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 rounded-2xl border border-neutral-200 bg-white/80 p-4">
          <p className="font-semibold">Recommended MCP input schema</p>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-neutral-700">
            <li><code>prompt</code> is required and should describe the trigger, actors, main flow, decision points, exception paths, and end states in one workflow.</li>
            <li><code>context_scope</code> is required and must be one of <code>lock</code>, <code>quote</code>, <code>solution</code>, or <code>cross_suite</code>.</li>
            <li><code>include_bpmn_xml</code> is optional. Set it only when your MCP client needs the raw BPMN XML in the tool response.</li>
          </ul>
        </div>
        <div className="mt-5 rounded-2xl border border-neutral-200 bg-white/80 p-4">
          <p className="font-semibold">Prompting tips</p>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-neutral-700">
            <li>Use a compact structure such as Trigger, Actors, Main flow, Decisions, Exceptions, End states.</li>
            <li>Choose the closest context scope: Lock, Quote / Quick, Solution, or Cross-suite.</li>
            <li>Include approval rules, exception paths, or follow-up actions if they matter.</li>
            <li>Keep one workflow per request so the BPMN stays readable.</li>
            <li>For larger tasks, keep the diagram focused on the primary end-to-end flow and leave minor detail inside task labels.</li>
          </ul>
          <p className="mt-4 text-sm leading-7 text-neutral-700">
            Example prompt: <code>Trigger: Sales rep drafts a quote. Actors:
            Sales rep, manager, buyer. Main flow: Draft quote -&gt; review
            discount -&gt; send quote -&gt; buyer responds. Decisions: Manager
            approval is required when discount exceeds threshold. Exceptions:
            Buyer requests revision or quote expires. End states: Quote sent,
            revised, accepted, or expired.</code>
          </p>
        </div>
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
            <li>
              Use <code>generate_workflow_artifact</code> for one workflow at a time, pass the closest <code>context_scope</code>, and only request <code>include_bpmn_xml</code> when you need raw XML back.
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

      <section className="panel mt-8 p-6">
        <h2 className="text-2xl font-semibold">v0 preview troubleshooting</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-neutral-700">
          The <code>generate_reference_ui</code> tool can return both a v0
          chat URL and a demo URL. The chat URL is the editable source
          conversation. The demo URL is the shareable preview deployment.
        </p>
        <ul className="mt-4 space-y-3 text-sm leading-7 text-neutral-700">
          <li>If a demo opens with <code>Runtime Error</code> and a message like <code>Unexpected identifier 'agency'</code>, the problem is usually invalid generated TSX or JavaScript inside the v0 preview.</li>
          <li>This is usually not a broken link in BA Agents. Link or token issues typically fail with access, auth, or unavailable errors instead.</li>
          <li>The same demo can appear fine on one machine and fail on another because of cache differences or because the other machine loads the latest preview bundle path directly.</li>
          <li>When sharing a UI reference, send both the demo URL and the chat URL so reviewers can fall back to the editable source.</li>
        </ul>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="font-semibold">When the demo fails</p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-neutral-700">
              <li>Open the chat URL.</li>
              <li>Inspect the latest generated version.</li>
              <li>Regenerate the preview from the same confirmed task.</li>
              <li>Shorten or simplify labels and mock data if the generated code looks fragile.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white/80 p-4">
            <p className="font-semibold">How to get more stable previews</p>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-neutral-700">
              <li>Pass the full confirmed UX/UI task, not only a short feature name.</li>
              <li>Keep the scope to one page with a small number of sections and states.</li>
              <li>Prefer short static mock data.</li>
              <li>Rewrite visible comparison symbols into words, such as <code>over</code> or <code>at least</code>.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
