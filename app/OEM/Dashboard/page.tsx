import Layout from "@/containers/Layout";
import HomePage from "@/containers/OemDashboard";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="w-full flex items-center justify-center h-full">
          <span className="loading loading-dots loading-xl text-info"></span>
        </div>
      }
    >
      <Layout>
        <HomePage />
      </Layout>
    </Suspense>
  );
}
