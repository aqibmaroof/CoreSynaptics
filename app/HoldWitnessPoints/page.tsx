import IssuesList from "@/containers/Issues/List";
import Layout from "@/containers/Layout";
import { Suspense } from "react";

export default function Page() {
  return (
    <Layout>
      <Suspense fallback="loading hold witness points...">
        <IssuesList />
      </Suspense>
    </Layout>
  );
}
