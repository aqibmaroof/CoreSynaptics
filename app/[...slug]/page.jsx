import Layout from "@/containers/Layout";
import RoutePlaceholder from "@/components/RoutePlaceholder";

// Root catch-all: any path that does NOT match a more specific route in /app
// lands here instead of Next.js's default 404 screen. It renders the standard
// app shell with a friendly "under construction" placeholder so navigation
// never dead-ends on a not-found page. Specific routes always take priority
// over this catch-all, and "/" is served by app/page.tsx — so this only ever
// catches genuinely-unbuilt paths.
export default function CatchAllPage() {
  return (
    <Layout>
      <RoutePlaceholder />
    </Layout>
  );
}
