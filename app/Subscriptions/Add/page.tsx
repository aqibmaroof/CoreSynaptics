import { Suspense } from "react";
import SubscriptionAdd from "../../../containers/Subscriptions/Add";
import Layout from "@/containers/Layout";

export default function Add() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout>
        <SubscriptionAdd />
      </Layout>
    </Suspense>
  );
}
