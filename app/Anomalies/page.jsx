"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/containers/Layout";
import AnomalyInbox from "@/containers/Anomalies";

function Entry() {
  const params = useSearchParams();
  const cxProjectId = params.get("cxProjectId") || "";
  return <AnomalyInbox cxProjectId={cxProjectId} />;
}

export default function AnomaliesPage() {
  return (
    <Layout>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <Entry />
      </Suspense>
    </Layout>
  );
}
