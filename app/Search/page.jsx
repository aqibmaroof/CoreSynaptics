import { Suspense } from "react";
import Layout from "@/containers/Layout";
import SearchResults from "@/containers/Search";

export default function SearchPage() {
  return (
    <Layout>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
        <SearchResults />
      </Suspense>
    </Layout>
  );
}
