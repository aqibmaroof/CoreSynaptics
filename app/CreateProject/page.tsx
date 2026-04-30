import { Suspense } from "react";
import CreateProject from "../../containers/CreateProject";
import Layout from "@/containers/Layout";

export default function List() {
  return (
    <Suspense fallback="Loading...">
      <Layout>
        <CreateProject />
      </Layout>
    </Suspense>
  );
}
