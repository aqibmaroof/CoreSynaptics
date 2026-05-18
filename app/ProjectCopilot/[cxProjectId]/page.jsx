import Layout from "@/containers/Layout";
import ProjectCopilot from "@/containers/ProjectCopilot";

export default async function ProjectCopilotByIdPage({ params }) {
  const { cxProjectId } = await params;
  return (
    <Layout>
      <ProjectCopilot cxProjectId={cxProjectId} />
    </Layout>
  );
}
