import { NextResponse } from "next/server";

import { getWorkflowArtifactBySlug } from "@/lib/db/workflows";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const artifact = await getWorkflowArtifactBySlug(slug);

  if (!artifact) {
    return NextResponse.json({ error: "Workflow artifact not found." }, { status: 404 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("download") === "xml") {
    return new Response(artifact.bpmnXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${artifact.slug}.bpmn.xml"`,
      },
    });
  }

  return NextResponse.json({
    artifact: {
      ...artifact,
      createdAt: artifact.createdAt.toISOString(),
      updatedAt: artifact.updatedAt.toISOString(),
    },
  });
}
