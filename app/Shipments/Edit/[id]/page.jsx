import ShipmentEdit from "@/containers/ShipmentLogistics/Edit";
import Layout from "@/containers/Layout";

export default function ShipmentEditPage({ params }) {
  return (
    <Layout>
      <ShipmentEdit editId={params.id} />
    </Layout>
  );
}
