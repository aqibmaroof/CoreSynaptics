"use client";

import { use } from "react";
import CxLayout from "@/containers/Layout";
import CxScoreDashboard from "@/containers/CxScore";

export default function CxScorePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  return (
    <CxLayout>
      <CxScoreDashboard projectId={projectId} />
    </CxLayout>
  );
}
