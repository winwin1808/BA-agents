import { promises as fs } from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import MiniSearch from "minisearch";

import {
  buildDocumentId,
  getAppFromPath,
  getChangelogApp,
  getDocumentKind,
  getDocumentUri,
  inferSummary,
  inferTags,
  inferTitle,
  normalizePath,
  searchOptions,
} from "../src/lib/content/config";
import type { DocumentRecord } from "../src/lib/content/types";

const ROOT = process.cwd();
const CONTEXT_DIR = path.join(ROOT, "context");
const GENERATED_DIR = path.join(ROOT, "src", "generated");

async function collectMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return collectMarkdownFiles(fullPath);
      }

      if (entry.isFile() && entry.name.endsWith(".md")) {
        return [fullPath];
      }

      return [];
    }),
  );

  return files.flat();
}

function buildRecord(relativePath: string, markdown: string): DocumentRecord {
  const parsed = matter(markdown);
  const content = parsed.content.trim();
  const title =
    typeof parsed.data.title === "string" && parsed.data.title.trim().length > 0
      ? parsed.data.title.trim()
      : inferTitle(relativePath, content);

  const app = getDocumentKind(relativePath) === "changelog"
    ? getChangelogApp(relativePath)
    : getAppFromPath(relativePath);

  const summary = inferSummary(content);

  return {
    id: buildDocumentId(relativePath),
    uri: getDocumentUri(relativePath),
    title,
    kind: getDocumentKind(relativePath),
    app,
    path: relativePath,
    summary,
    content,
    tags: inferTags(relativePath, title, summary),
  };
}

async function main() {
  const files = await collectMarkdownFiles(CONTEXT_DIR);
  const records = await Promise.all(
    files.map(async (filePath) => {
      const markdown = await fs.readFile(filePath, "utf8");
      const relativePath = normalizePath(path.relative(ROOT, filePath));
      return buildRecord(relativePath, markdown);
    }),
  );

  const manifest = records.sort((left, right) => left.path.localeCompare(right.path));

  const miniSearch = new MiniSearch<DocumentRecord>(searchOptions);
  miniSearch.addAll(manifest);

  await fs.mkdir(GENERATED_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(
      path.join(GENERATED_DIR, "content-manifest.json"),
      `${JSON.stringify(manifest, null, 2)}\n`,
      "utf8",
    ),
    fs.writeFile(
      path.join(GENERATED_DIR, "content-search-index.json"),
      `${JSON.stringify(miniSearch.toJSON(), null, 2)}\n`,
      "utf8",
    ),
  ]);

  process.stdout.write(
    `Built ${manifest.length} content records into ${path.relative(ROOT, GENERATED_DIR)}.\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
