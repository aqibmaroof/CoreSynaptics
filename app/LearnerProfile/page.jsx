"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Layout from "@/containers/Layout";
import LearnerProfile from "@/containers/LearnerProfile";

function Entry() {
  const params = useSearchParams();
  const userId = params.get("userId") || "";
  const roleName = params.get("roleName") || "";
  return <LearnerProfile userId={userId} roleName={roleName || undefined} />;
}

export default function LearnerProfilePage() {
  return (
    <Layout>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <Entry />
      </Suspense>
    </Layout>
  );
}
