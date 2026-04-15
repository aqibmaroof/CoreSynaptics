import SuppliersAdd from "@/containers/Inventory/Suppliers/Add";
import Layout from "@/containers/Layout";

export default function SuppliersEditPage({ params }) {
  return (
    <Layout>
      <SuppliersAdd editId={params.id} />
    </Layout>
  );
}
