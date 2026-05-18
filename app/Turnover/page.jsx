"use client";

// Top-level entry: pulls cxProjectId from query string. The full view lives
// in containers/Turnover.

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/containers/Layout";
import TurnoverPackages from "@/containers/Turnover";

function TurnoverEntry() {
  const params = useSearchParams();
  const cxProjectId = params.get("cxProjectId") || "";
  return <TurnoverPackages cxProjectId={cxProjectId} />;
}

export default function TurnoverPage() {
  return (
    <Layout>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <TurnoverEntry />
      </Suspense>
    </Layout>
  );
}
