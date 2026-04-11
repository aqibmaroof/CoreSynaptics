import WarehousesAdd from "@/containers/Inventory/Warehouses/Add";
import Layout from "@/containers/Layout";

export default function WarehousesEditPage({ params }) {
  return (
    <Layout>
      <WarehousesAdd editId={params.id} />
    </Layout>
  );
}
