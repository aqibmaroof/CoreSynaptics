import Layout from "@/containers/Layout";

export default function Page() {
  return (
    <Layout>
      <div style={{ padding: 24 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--cx-text)",
            marginBottom: 8,
          }}
        >
          Cx Flow Diagram
        </h1>
        <p style={{ color: "var(--cx-text-muted)" }}>
          Commissioning flow diagram — coming soon.
        </p>
      </div>
    </Layout>
  );
}
