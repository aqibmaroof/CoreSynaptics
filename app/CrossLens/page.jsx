"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/containers/Layout";
import CrossLensDashboard from "@/containers/CrossLens";

function Entry() {
  const params = useSearchParams();
  const cxProjectId = params.get("cxProjectId") || "";
  return <CrossLensDashboard cxProjectId={cxProjectId} />;
}

export default function CrossLensPage() {
  return (
    <Layout>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <Entry />
      </Suspense>
    </Layout>
  );
}
