import ProductEdit from "@/containers/Inventory/Products/Edit";
import Layout from "@/containers/Layout";

export default function ProductEditPage({ params }) {
  return (
    <Layout>
      <ProductEdit editId={params.id} />
    </Layout>
  );
}
