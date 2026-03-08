import AddUsers from "../../../containers/Users/Add";
import Layout from "../../../containers/Layout";
import { Suspense } from "react";

export default function List() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <AddUsers />
      </Layout>
    </Suspense>
  );
}
