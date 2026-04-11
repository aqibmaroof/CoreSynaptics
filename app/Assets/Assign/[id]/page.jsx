import AssetAssign from "@/containers/AssetManagement/Assign";
import Layout from "@/containers/Layout";

export default function AssetAssignPage({ params }) {
  return (
    <Layout>
      <AssetAssign assetId={params.id} />
    </Layout>
  );
}
