import { Suspense } from "react";
import Layout from "@/containers/Layout";
import Diagnostics from "@/containers/Diagnostics";

export default function DiagnosticsPage() {
  return (
    <Layout>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <Diagnostics />
      </Suspense>
    </Layout>
  );
}
