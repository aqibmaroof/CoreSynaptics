"use client";

import CxLayout from "@/containers/Layout";
import PSSRList from "@/containers/PSSR/List";

export default function PSSRPage() {
  return (
    <CxLayout>
      <PSSRList cxProjectId={undefined} />
    </CxLayout>
  );
}
