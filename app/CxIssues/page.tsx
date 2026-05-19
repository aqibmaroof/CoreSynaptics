"use client";

import { Suspense } from "react";
import CxLayout from "@/containers/Layout";
import CxIssues from "@/containers/CxIssues";

export default function CxIssuesPage() {
  // CxIssues uses useSearchParams() to read ?focus=<issueId> for deep-links
  // (e.g. from PSSR Detail). Next.js 16 requires the consumer to be inside a
  // Suspense boundary; otherwise client-only navigation breaks SSR.
  return (
    <CxLayout>
      <Suspense fallback={null}>
        <CxIssues cxProjectId={undefined} />
      </Suspense>
    </CxLayout>
  );
}
