"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/containers/Layout";
import CrossDomainInspector from "@/containers/CrossDomain";

function Entry() {
  const params = useSearchParams();
  const cxProjectId = params.get("cxProjectId") || "";
  return <CrossDomainInspector cxProjectId={cxProjectId} />;
}

export default function CrossDomainPage() {
  return (
    <Layout>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <Entry />
      </Suspense>
    </Layout>
  );
}
