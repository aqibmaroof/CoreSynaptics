"use client";

import CxLayout from "@/containers/Layout";
import CxAnnouncements from "@/containers/CxAnnouncements";

export default function CxAnnouncementsPage() {
  // isGcReviewer flag: in production derive from user.role / lens; default to true
  // here so the demo surfaces the approve/reject buttons.
  return (
    <CxLayout>
      <CxAnnouncements cxProjectId={undefined} isGcReviewer={true} />
    </CxLayout>
  );
}
