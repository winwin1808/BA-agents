import { randomUUID } from "node:crypto";

import { layoutProcess } from "bpmn-auto-layout";

import type { WorkflowGraph, WorkflowNode } from "@/lib/workflows/types";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function toElementName(node: WorkflowNode) {
  switch (node.kind) {
    case "start_event":
      return "bpmn:startEvent";
    case "task":
      return "bpmn:task";
    case "exclusive_gateway":
      return "bpmn:exclusiveGateway";
    case "end_event":
      return "bpmn:endEvent";
  }
}

export function buildSemanticBpmnXml(graph: WorkflowGraph, processName: string) {
  const processId = `Process_${randomUUID().replaceAll("-", "_")}`;
  const incomingByNode = new Map<string, string[]>();
  const outgoingByNode = new Map<string, string[]>();

  for (const edge of graph.edges) {
    incomingByNode.set(edge.target, [...(incomingByNode.get(edge.target) ?? []), edge.id]);
    outgoingByNode.set(edge.source, [...(outgoingByNode.get(edge.source) ?? []), edge.id]);
  }

  const nodesXml = graph.nodes
    .map((node) => {
      const incoming = (incomingByNode.get(node.id) ?? [])
        .map((edgeId) => `<bpmn:incoming>${escapeXml(edgeId)}</bpmn:incoming>`)
        .join("");
      const outgoing = (outgoingByNode.get(node.id) ?? [])
        .map((edgeId) => `<bpmn:outgoing>${escapeXml(edgeId)}</bpmn:outgoing>`)
        .join("");

      return [
        `<${toElementName(node)} id="${escapeXml(node.id)}" name="${escapeXml(node.label)}">`,
        incoming,
        outgoing,
        `</${toElementName(node)}>` ,
      ].join("");
    })
    .join("");

  const edgesXml = graph.edges
    .map((edge) => {
      const name = edge.label ? ` name="${escapeXml(edge.label)}"` : "";
      return `<bpmn:sequenceFlow id="${escapeXml(edge.id)}" sourceRef="${escapeXml(edge.source)}" targetRef="${escapeXml(edge.target)}"${name} />`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_${escapeXml(processId)}"
  targetNamespace="https://bsscommerce.com/ba-agents/workflows">
  <bpmn:process id="${escapeXml(processId)}" isExecutable="false" name="${escapeXml(processName)}">
    ${nodesXml}
    ${edgesXml}
  </bpmn:process>
</bpmn:definitions>`;
}

export async function buildLaidOutBpmnXml(graph: WorkflowGraph, processName: string) {
  const semanticXml = buildSemanticBpmnXml(graph, processName);
  return layoutProcess(semanticXml);
}
