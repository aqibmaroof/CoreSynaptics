import ChangeRequestEdit from "@/containers/ChangeRequests/Edit";
import Layout from "@/containers/Layout";
import { Suspense } from "react";

export default function ChangeRequestEditPage() {
  return (
    <Suspense fallback="Loading...">
      <Layout>
        <ChangeRequestEdit />
      </Layout>
    </Suspense>
  );
}
