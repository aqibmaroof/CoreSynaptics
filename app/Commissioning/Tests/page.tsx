"use client";

import CxLayout from "@/containers/Layout";
import CommissioningTestsList from "@/containers/CommissioningTests/List";

export default function CommissioningTestsPage() {
  return (
    <CxLayout>
      <CommissioningTestsList cxProjectId={undefined} />
    </CxLayout>
  );
}
