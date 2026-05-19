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
          Cx Master Log
        </h1>
        <p style={{ color: "var(--cx-text-muted)" }}>
          Commissioning master log — coming soon.
        </p>
      </div>
    </Layout>
  );
}
