"use client";

import { use } from "react";
import CxLayout from "@/containers/Layout";
import PSSRDetail from "@/containers/PSSR/Detail";

export default function PSSRDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 16: params is a Promise; unwrap with React.use
  const { id } = use(params);
  return (
    <CxLayout>
      <PSSRDetail id={id} />
    </CxLayout>
  );
}
