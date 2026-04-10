"use client";

import { useEffect, useRef, useState } from "react";

import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";

export function WorkflowDiagramViewer(props: { xml: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<NavigatedViewer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const viewer = new NavigatedViewer({
      container: containerRef.current,
      height: "100%",
      width: "100%",
    });

    viewerRef.current = viewer;

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) {
      return;
    }

    let cancelled = false;

    void viewer
      .importXML(props.xml)
      .then(() => {
        if (cancelled) {
          return;
        }

        const canvas = viewer.get("canvas") as { zoom: (value: string, center?: string) => void };
        canvas.zoom("fit-viewport", "auto");
        setError(null);
      })
      .catch((viewerError: unknown) => {
        if (cancelled) {
          return;
        }

        setError(
          viewerError instanceof Error
            ? viewerError.message
            : "Diagram rendering failed.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [props.xml]);

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white/80 p-4">
      <div className="h-[75vh] min-h-[560px] overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <div className="h-full w-full" ref={containerRef} />
      </div>
      {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
