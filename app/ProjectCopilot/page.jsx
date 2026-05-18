"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/containers/Layout";
import ProjectCopilot from "@/containers/ProjectCopilot";

function Entry() {
  const params = useSearchParams();
  const cxProjectId = params.get("cxProjectId") || "";
  return <ProjectCopilot cxProjectId={cxProjectId} />;
}

export default function ProjectCopilotPage() {
  return (
    <Layout>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <Entry />
      </Suspense>
    </Layout>
  );
}
