import IssuesList from "@/containers/Issues/List";
import Layout from "@/containers/Layout";
import { Suspense } from "react";

export default function Page() {
  return (
    <Layout>
      <Suspense fallback="Loading punch list...">
        <IssuesList />
      </Suspense>
    </Layout>
  );
}
