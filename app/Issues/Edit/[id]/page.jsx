import IssuesEdit from "@/containers/Issues/Edit";
import Layout from "@/containers/Layout";

export default function IssueEditPage({ params }) {
  return (
    <Layout>
      <IssuesEdit editId={params.id} />
    </Layout>
  );
}
