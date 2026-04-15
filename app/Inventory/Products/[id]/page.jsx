import ProductSKUs from "@/containers/Inventory/Products/SKUs";
import Layout from "@/containers/Layout";

export default function ProductSKUsPage({ params }) {
  return (
    <Layout>
      <ProductSKUs productId={params.id} />
    </Layout>
  );
}
