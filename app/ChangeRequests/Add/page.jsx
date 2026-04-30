import ChangeRequestAdd from "@/containers/ChangeRequests/Add";
import Layout from "@/containers/Layout";
import { Suspense } from "react";

export default function ChangeRequestAddPage() {
  return (
    <Suspense fallback="Loading...">
      <Layout>
        <ChangeRequestAdd />
      </Layout>
    </Suspense>
  );
}
