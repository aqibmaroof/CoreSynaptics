"use client";

import CxLayout from "@/containers/Layout";
import RiskRegisterList from "@/containers/RiskRegister/List";

export default function RiskRegisterPage() {
  return (
    <CxLayout>
      <RiskRegisterList cxProjectId={undefined} />
    </CxLayout>
  );
}
