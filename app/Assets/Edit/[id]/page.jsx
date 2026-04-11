import AssetEdit from "@/containers/AssetManagement/Edit";
import Layout from "@/containers/Layout";

export default function AssetEditPage({ params }) {
  return (
    <Layout>
      <AssetEdit editId={params.id} />
    </Layout>
  );
}
