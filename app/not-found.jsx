import Layout from "@/containers/Layout";
import RoutePlaceholder from "@/components/RoutePlaceholder";

// Final fallback for any not-found triggered internally (e.g. notFound() calls
// or framework edge cases the catch-all route doesn't intercept). Keeps the
// user inside the app shell rather than on a bare 404 page.
export default function NotFound() {
  return (
    <Layout>
      <RoutePlaceholder title="Page not found" />
    </Layout>
  );
}
