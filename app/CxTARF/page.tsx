"use client";

import CxLayout from "@/containers/CxLayout";
import CxTARF from "@/containers/CxTARF";

export default function CxTARFPage() {
  // isGcReviewer / isCustomerReviewer / isGateStaff flags: in production
  // derive from user.role / lens. Defaulted true here for demo so all
  // approval and sign-in/out actions are visible.
  return (
    <CxLayout>
      <CxTARF
        cxProjectId={undefined}
        isGcReviewer={true}
        isCustomerReviewer={true}
        isGateStaff={true}
      />
    </CxLayout>
  );
}
