import TARFEdit from "@/containers/TARF/Edit";
import Layout from "@/containers/Layout";

export default function TARFEditPage({ params }) {
  return (
    <Layout>
      <TARFEdit editId={params.id} />
    </Layout>
  );
}
