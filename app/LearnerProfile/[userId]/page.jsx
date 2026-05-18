import Layout from "@/containers/Layout";
import LearnerProfile from "@/containers/LearnerProfile";

export default async function LearnerProfileByIdPage({ params, searchParams }) {
  const { userId } = await params;
  const sp = (await searchParams) || {};
  const roleName = typeof sp.roleName === "string" ? sp.roleName : undefined;
  return (
    <Layout>
      <LearnerProfile userId={userId} roleName={roleName} />
    </Layout>
  );
}
