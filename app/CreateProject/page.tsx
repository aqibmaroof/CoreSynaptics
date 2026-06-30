import { redirect } from "next/navigation";

// The 21-step CreateProject wizard (containers/CreateProject) is the deprecated
// "old" project module. The active project module is NewProjectsModule at
// /Projects. Bounce any stale link/bookmark to the new module.
export default function CreateProjectDeprecated() {
  redirect("/Projects");
}
