"use client";

import CxLayout from "@/containers/CxLayout";
import CommissioningTestsList from "@/containers/CommissioningTests/List";

export default function CommissioningTestsPage() {
  return (
    <CxLayout>
      <CommissioningTestsList cxProjectId={undefined} />
    </CxLayout>
  );
}
