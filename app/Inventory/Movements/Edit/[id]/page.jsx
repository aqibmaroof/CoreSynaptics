import MovementsEdit from "@/containers/Inventory/Movements/Edit";
import Layout from "@/containers/Layout";

export default function MovementEditPage({ params }) {
  return (
    <Layout>
      <MovementsEdit editId={params.id} />
    </Layout>
  );
}
