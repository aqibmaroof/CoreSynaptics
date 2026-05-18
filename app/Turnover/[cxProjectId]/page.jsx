import Layout from "@/containers/Layout";
import TurnoverPackages from "@/containers/Turnover";

export default async function TurnoverByProjectPage({ params }) {
  const { cxProjectId } = await params;
  return (
    <Layout>
      <TurnoverPackages cxProjectId={cxProjectId} />
    </Layout>
  );
}
